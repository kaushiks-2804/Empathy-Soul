        // Interactive cursor effect
class InteractiveCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        
        this.cursorTrail = document.createElement('div');
        this.cursorTrail.className = 'cursor-trail';
        document.body.appendChild(this.cursorTrail);
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.trailX = 0;
        this.trailY = 0;
        
        this.init();
    }
    
    init() {
        // Smoother cursor movement with lerp (linear interpolation)
        const updateCursorPosition = () => {
            // Smooth follow effect
            this.cursorX += (this.mouseX - this.cursorX) * 0.3;
            this.cursorY += (this.mouseY - this.cursorY) * 0.3;
            
            this.trailX += (this.mouseX - this.trailX) * 0.1;
            this.trailY += (this.mouseY - this.trailY) * 0.1;
            
            this.cursor.style.left = `${this.cursorX}px`;
            this.cursor.style.top = `${this.cursorY}px`;
            
            this.cursorTrail.style.left = `${this.trailX}px`;
            this.cursorTrail.style.top = `${this.trailY}px`;
            
            requestAnimationFrame(updateCursorPosition);
        };
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Click animation
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('cursor-click');
            this.cursorTrail.classList.add('trail-click');
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('cursor-click');
            this.cursorTrail.classList.remove('trail-click');
        });
        
        // Add hover effect for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .feature-card, .step-card, input, textarea, select, label');
        interactiveElements.forEach(elem => {
            elem.addEventListener('mouseenter', () => {
                this.cursor.classList.add('cursor-hover');
                this.cursorTrail.classList.add('trail-hover');
                
                // Add subtle magnetic effect for buttons and links
                if (elem.tagName === 'A' || elem.tagName === 'BUTTON' || elem.classList.contains('btn')) {
                    elem.addEventListener('mousemove', (e) => {
                        const { left, top, width, height } = elem.getBoundingClientRect();
                        const centerX = left + width / 2;
                        const centerY = top + height / 2;
                        const distanceX = (e.clientX - centerX) / (width / 2);
                        const distanceY = (e.clientY - centerY) / (height / 2);
                        
                        // Subtle magnetic pull
                        this.mouseX = e.clientX - distanceX * 3;
                        this.mouseY = e.clientY - distanceY * 3;
                    });
                }
            });
            
            elem.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('cursor-hover');
                this.cursorTrail.classList.remove('trail-hover');
            });
        });
        
        // Check for mobile/touch devices and disable cursor if needed
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.cursor.style.display = 'none';
            this.cursorTrail.style.display = 'none';
            document.body.style.cursor = 'auto';
        } else {
            updateCursorPosition();
        }
    }
}

// Particle background effect
class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-bg';
        
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouseX = 0;
            this.mouseY = 0;
            this.init();
        }
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Track mouse position for interactive particles
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.createParticles();
        this.animate();
    }
    
    resize() {
        const hero = document.querySelector('.hero');
        if (hero) {
            this.canvas.width = hero.offsetWidth;
            this.canvas.height = hero.offsetHeight;
        }
    }
    
    createParticles() {
        const particleCount = Math.floor(window.innerWidth * 0.05);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                baseSize: Math.random() * 2 + 1,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        // Colors that align with the Empathy Soul brand
        const colors = [
            'rgba(0, 255, 229, alpha)', // Cyan
            'rgba(109, 93, 252, alpha)', // Purple
            'rgba(46, 49, 146, alpha)'  // Deep Blue
        ];
        
        return colors[Math.floor(Math.random() * colors.length)].replace('alpha', (Math.random() * 0.5 + 0.2).toFixed(2));
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off walls
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            // Interactive behavior: particles are attracted to cursor
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Interaction zone
            if (distance < 100) {
                // Grow particles near the cursor
                particle.size = particle.baseSize * (1 + (100 - distance) / 50);
                
                // Subtle attraction
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (100 - distance) / 2000;
                
                particle.speedX += forceDirectionX * force;
                particle.speedY += forceDirectionY * force;
                
                // Limit speed
                const maxSpeed = 2;
                const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
                if (speed > maxSpeed) {
                    particle.speedX = (particle.speedX / speed) * maxSpeed;
                    particle.speedY = (particle.speedY / speed) * maxSpeed;
                }
            } else {
                // Reset size when away from cursor
                particle.size = particle.baseSize;
            }
            
            // Draw particle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Scroll reveal animation
class ScrollReveal {
    constructor() {
        this.revealElements = document.querySelectorAll('.reveal');
        this.init();
    }
    
    init() {
        this.checkReveal();
        window.addEventListener('scroll', () => this.checkReveal());
    }
    
    checkReveal() {
        this.revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
}

// Text typing animation
class TypedText {
    constructor(element, textArray, options = {}) {
        this.element = element;
        this.textArray = textArray;
        this.currentText = '';
        this.letterIndex = 0;
        this.textArrayIndex = 0;
        this.typingSpeed = options.typingSpeed || 50;
        this.deletingSpeed = options.deletingSpeed || 30;
        this.delayAfterType = options.delayAfterType || 2000;
        this.delayAfterDelete = options.delayAfterDelete || 500;
        this.loop = options.loop !== undefined ? options.loop : true;
        this.isDeleting = false;
        this.isWaiting = false;
        this.init();
    }
    
    init() {
        this.typeText();
    }
    
    typeText() {
        const currentWord = this.textArray[this.textArrayIndex];
        
        if (this.isDeleting) {
            // Remove characters
            this.currentText = currentWord.substring(0, this.letterIndex - 1);
            this.letterIndex--;
        } else {
            // Add characters
            this.currentText = currentWord.substring(0, this.letterIndex + 1);
            this.letterIndex++;
        }
        
        this.element.textContent = this.currentText;
        
        let typingSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        if (!this.isDeleting && this.letterIndex === currentWord.length) {
            // Word is complete
            typingSpeed = this.delayAfterType;
            this.isDeleting = true;
        } else if (this.isDeleting && this.letterIndex === 0) {
            // Word is deleted
            this.isDeleting = false;
            this.textArrayIndex++;
            
            if (this.textArrayIndex === this.textArray.length) {
                if (this.loop) {
                    this.textArrayIndex = 0;
                } else {
                    return;
                }
            }
            
            typingSpeed = this.delayAfterDelete;
        }
        
        setTimeout(() => this.typeText(), typingSpeed);
    }
}

// Initialize all interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursor
    new InteractiveCursor();
    
    // Initialize particle background
    new ParticleBackground();
    
    // Initialize scroll reveal
    new ScrollReveal();
    
    // Initialize typing animation
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypedText(typingElement, [
            'Empower Your Emotional Intelligence',
            'Discover Your Inner Strength',
            'Transform Your Emotional Well-being',
            'Begin Your Journey to Self-Discovery'
        ], {
            typingSpeed: 70,
            deletingSpeed: 40,
            delayAfterType: 3000,
            delayAfterDelete: 700
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
