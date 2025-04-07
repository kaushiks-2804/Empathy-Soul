import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from datetime import datetime
from dotenv import load_dotenv
from flask_migrate import Migrate
import requests
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
import torch
from gtts import gTTS
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__, 
            template_folder='src/templates',
            static_folder='src/static')

# Configure app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'empathy_soul_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# Models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    journal_entries = db.relationship('JournalEntry', backref='author', lazy=True)
    mood_entries = db.relationship('MoodEntry', backref='user', lazy=True)
    community_posts = db.relationship('CommunityPost', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"JournalEntry('{self.title}', '{self.date_posted}')"

class MoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text)
    date_recorded = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"MoodEntry('{self.mood}', '{self.date_recorded}')"

class CommunityPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship('Comment', backref='post', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('community_post.id'), nullable=False)

# Forms
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is already taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is already registered. Please use a different one.')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class JournalForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    content = TextAreaField('Content', validators=[DataRequired()])
    submit = SubmitField('Save')

class CommunityPostForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(min=5, max=100)])
    content = TextAreaField('Content', validators=[DataRequired()])
    submit = SubmitField('Post')

class CommentForm(FlaskForm):
    content = TextAreaField('Comment', validators=[DataRequired()])
    submit = SubmitField('Submit')

# KDC AI Companion Integration
# Create a temporary directory for audio files
TEMP_DIR = "temp_audio"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Initialize model and tokenizer for KDC
model_name = "facebook/blenderbot-400M-distill"  # A smaller, faster model
try:
    kdc_tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
    kdc_model = BlenderbotForConditionalGeneration.from_pretrained(model_name)
except Exception as e:
    print(f"Error loading KDC model: {e}")
    kdc_tokenizer = None
    kdc_model = None

def generate_response(user_input):
    """Generate a text response using the BlenderBot model"""
    if kdc_tokenizer is None or kdc_model is None:
        return "I'm sorry, my language model is currently unavailable. Please try again later."
    
    # Tokenize input and generate response
    inputs = kdc_tokenizer([user_input], return_tensors="pt", truncation=True, max_length=512)
    reply_ids = kdc_model.generate(
        **inputs,
        max_length=128,
        num_return_sequences=1,
        temperature=0.7,
        pad_token_id=kdc_tokenizer.eos_token_id,
        no_repeat_ngram_size=3
    )
    response = kdc_tokenizer.batch_decode(reply_ids, skip_special_tokens=True)[0]
    return response

def text_to_speech(text):
    """Convert text to speech and save as an audio file"""
    # Generate unique filename
    audio_file = os.path.join(TEMP_DIR, f"{str(uuid.uuid4())}.mp3")
    
    # Generate speech
    tts = gTTS(text=text, lang='en')
    tts.save(audio_file)
    
    return audio_file

# KDC API Routes
@app.route('/kdc-api/chat', methods=['POST'])
@login_required
def kdc_chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Generate text response
        response_text = generate_response(user_message)
        
        # Generate speech
        audio_file = text_to_speech(response_text)
        
        return jsonify({
            'text': response_text,
            'audio_url': f'/kdc-api/audio/{os.path.basename(audio_file)}'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/kdc-api/audio/<filename>')
@login_required
def kdc_audio(filename):
    try:
        return send_file(
            os.path.join(TEMP_DIR, filename),
            mimetype='audio/mp3'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# Cleanup old audio files
@app.route('/kdc-api/cleanup', methods=['POST'])
@login_required
def kdc_cleanup():
    try:
        for file in os.listdir(TEMP_DIR):
            file_path = os.path.join(TEMP_DIR, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
        return jsonify({'message': 'Cleanup successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Context processor for template variables
@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/forgot-password')
def forgot_password():
    return render_template('forgot_password.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = RegistrationForm()
    if form.validate_on_submit():
        try:
            hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
            user = User(username=form.username.data, email=form.email.data, password=hashed_password)
            db.session.add(user)
            db.session.commit()
            flash('Your account has been created successfully! You can now log in', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred: {str(e)}', 'danger')
    return render_template('signup.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            flash('Login successful! Welcome back.', 'success')
            return redirect(next_page) if next_page else redirect(url_for('resources'))
        else:
            flash('Login unsuccessful. Please check your email and password', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully', 'info')
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    return redirect(url_for('resources'))

@app.route('/chatbot')
@login_required
def chatbot():
    return render_template('chatbot.html')

@app.route('/chatbot/message', methods=['POST'])
@login_required
def chatbot_message():
    data = request.json
    message = data.get('message', '')
    
    # In a real app, you would integrate with a language model API here
    # For now, we'll use a simple response system
    
    response = "I'm your Empathy Soul companion. While I'm not fully connected to an AI model right now, I'm here to listen and support you. Could you tell me more about how you're feeling today?"
    
    if "sad" in message.lower() or "depressed" in message.lower() or "unhappy" in message.lower():
        response = "I'm sorry to hear you're feeling down. Remember that it's okay to have these feelings, and they're a normal part of life. Would you like to talk more about what's causing these feelings?"
    
    elif "happy" in message.lower() or "good" in message.lower() or "great" in message.lower():
        response = "I'm glad to hear you're feeling positive! It's wonderful that you're experiencing these good emotions. What's contributing to your happiness today?"
    
    elif "anxious" in message.lower() or "nervous" in message.lower() or "worried" in message.lower():
        response = "Feeling anxious can be challenging. Taking deep breaths might help in the moment. Would you like to explore what's causing this anxiety?"
    
    elif "angry" in message.lower() or "mad" in message.lower() or "frustrated" in message.lower():
        response = "I understand that anger and frustration can be intense. These emotions often have important messages for us. What do you think triggered these feelings?"
    
    return jsonify({
        'response': response,
        'timestamp': datetime.utcnow().strftime('%H:%M')
    })

@app.route('/ai-companion')
@login_required
def ai_companion():
    return redirect('http://localhost:5173/')

@app.route('/ai-companion-files/<path:filename>')
@login_required
def ai_companion_files(filename):
    """Serve external files from the AI companion app."""
    # This is a security risk in production - only for development
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist'
    return send_from_directory(external_path, filename)

@app.route('/assets/<path:filename>')
@login_required
def ai_companion_assets(filename):
    """Serve static assets for the AI companion."""
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist\assets'
    return send_from_directory(external_path, filename)

@app.route('/models/<path:filename>')
@login_required
def ai_companion_models(filename):
    """Serve 3D models for the AI companion."""
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist\models'
    return send_from_directory(external_path, filename)

@app.route('/textures/<path:filename>')
@login_required
def ai_companion_textures(filename):
    """Serve texture files for the AI companion."""
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist\textures'
    return send_from_directory(external_path, filename)

@app.route('/images/<path:filename>')
@login_required
def ai_companion_images(filename):
    """Serve image files for the AI companion."""
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist\images'
    return send_from_directory(external_path, filename)

@app.route('/animations/<path:filename>')
@login_required
def ai_companion_animations(filename):
    """Serve animations for the AI companion."""
    external_path = r'A:\final try\character\r3f-virtual-girlfriend-frontend\dist\animations'
    return send_from_directory(external_path, filename)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/mood-tracker')
@login_required
def mood_tracker():
    moods = MoodEntry.query.filter_by(user_id=current_user.id).order_by(MoodEntry.date_recorded.desc()).all()
    return render_template('mood_tracker.html', moods=moods)

@app.route('/mood-tracker/add', methods=['POST'])
@login_required
def add_mood():
    if request.is_json:
        data = request.json
        mood = data.get('mood')
        notes = data.get('notes', '')
    else:
        mood = request.form.get('mood')
        notes = request.form.get('notes', '')
        
    mood_entry = MoodEntry(mood=mood, notes=notes, user_id=current_user.id)
    db.session.add(mood_entry)
    db.session.commit()
    
    if request.is_json:
        return jsonify({'success': True, 'message': 'Mood recorded successfully!'})
    else:
        flash('Mood recorded successfully!', 'success')
        return redirect(url_for('mood_tracker'))

@app.route('/journaling')
@login_required
def journaling():
    form = JournalForm()
    entries = JournalEntry.query.filter_by(user_id=current_user.id).order_by(JournalEntry.date_posted.desc()).all()
    return render_template('journaling.html', form=form, entries=entries)

@app.route('/journaling/add', methods=['POST'])
@login_required
def add_journal():
    form = JournalForm()
    if form.validate_on_submit():
        entry = JournalEntry(title=form.title.data, content=form.content.data, user_id=current_user.id)
        db.session.add(entry)
        db.session.commit()
        flash('Journal entry saved successfully!', 'success')
        return redirect(url_for('journaling'))
    flash('There was an error with your journal entry. Please try again.', 'danger')
    entries = JournalEntry.query.filter_by(user_id=current_user.id).order_by(JournalEntry.date_posted.desc()).all()
    return render_template('journaling.html', form=form, entries=entries)

@app.route('/resources')
@login_required
def resources():
    return render_template('resources.html')

@app.route('/join-community')
def join_community():
    return render_template('join_community.html')

@app.route('/community')
@login_required
def community():
    page = request.args.get('page', 1, type=int)
    posts = CommunityPost.query.order_by(CommunityPost.date_posted.desc()).paginate(page=page, per_page=6)
    return render_template('community.html', posts=posts)

@app.route('/community/post/new', methods=['GET', 'POST'])
@login_required
def new_post():
    form = CommunityPostForm()
    if form.validate_on_submit():
        post = CommunityPost(title=form.title.data, content=form.content.data, author_id=current_user.id)
        db.session.add(post)
        db.session.commit()
        flash('Your post has been created!', 'success')
        return redirect(url_for('community'))
    return render_template('create_post.html', form=form, legend='New Post')

@app.route('/community/post/<int:post_id>')
@login_required
def view_post(post_id):
    post = CommunityPost.query.get_or_404(post_id)
    form = CommentForm()
    return render_template('view_post.html', post=post, form=form)

@app.route('/community/post/<int:post_id>/comment', methods=['POST'])
@login_required
def add_comment(post_id):
    form = CommentForm()
    if form.validate_on_submit():
        comment = Comment(content=form.content.data, post_id=post_id, author_id=current_user.id)
        db.session.add(comment)
        db.session.commit()
        flash('Your comment has been added!', 'success')
    return redirect(url_for('view_post', post_id=post_id))

@app.route('/community/post/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    post = CommunityPost.query.get_or_404(post_id)
    post.likes += 1
    db.session.commit()
    return jsonify({'success': True, 'likes': post.likes})

@app.route('/emotional-intelligence')
def emotional_intelligence():
    return render_template('emotional_intelligence.html')

@app.route('/resource-library')
def resource_library():
    return render_template('resource_library.html')

# External app integration routes
@app.route('/meditation')
@login_required
def meditation_redirect():
    """Redirect to the Meditation application"""
    return redirect('http://localhost:8080')

@app.route('/moodscape')
@login_required
def moodscape_redirect():
    """Redirect to the Moodscape application"""
    return redirect('http://localhost:5003')

@app.route('/qa-platform')
@login_required
def qa_platform_redirect():
    """Redirect to the Q&A Platform"""
    return redirect('http://localhost:5004/q-a.html')

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', error_code=404, error_message="Page not found"), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('error.html', error_code=500, error_message="Internal server error"), 500

# Create database tables and default user
def create_default_user():
    admin_user = User.query.filter_by(email='admin@empathysoul.com').first()
    if not admin_user:
        hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
        admin_user = User(username='admin', email='admin@empathysoul.com', password=hashed_password)
        db.session.add(admin_user)
        try:
            db.session.commit()
            print('Default admin user created successfully.')
        except Exception as e:
            db.session.rollback()
            print(f'Error creating default user: {str(e)}')

with app.app_context():
    db.create_all()
    create_default_user()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
