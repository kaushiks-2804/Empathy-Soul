// Main JavaScript file for Empathy Soul

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Setup animations
    setupAnimations();
    
    // Handle forms
    setupForms();
    
    // Create visual effects (if on pages that need them)
    if (document.getElementById('neuronBackground')) {
        createNeuronEffect();
    }
}

// Setup form validation and animations
function setupForms() {
    // Find all forms with validation
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
    
    // Add focus effects to inputs
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary-color)';
            input.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                input.style.boxShadow = 'none';
            }
        });
    });
}

// Form validation function
function validateForm(form) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Get all required inputs
    const requiredInputs = form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        // Reset previous validation state
        input.classList.remove('is-invalid');
        const feedbackElement = input.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.remove();
        }
        
        // Check if empty
        if (!input.value.trim()) {
            isValid = false;
            showError(input, 'This field is required');
        } 
        // Check email format
        else if (input.type === 'email' && !emailRegex.test(input.value)) {
            isValid = false;
            showError(input, 'Please enter a valid email address');
        }
        // Check password length
        else if (input.type === 'password' && input.value.length < 6) {
            isValid = false;
            showError(input, 'Password must be at least 6 characters');
        }
    });
    
    // Check if passwords match
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirm_password"]');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        showError(confirmPassword, 'Passwords do not match');
    }
    
    return isValid;
}

// Show error message
function showError(input, message) {
    input.classList.add('is-invalid');
    
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'invalid-feedback';
    feedbackDiv.innerText = message;
    
    input.parentNode.insertBefore(feedbackDiv, input.nextSibling);
    
    // Animate the error
    input.style.animation = 'shake 0.5s';
    setTimeout(() => {
        input.style.animation = '';
    }, 500);
}

// Setup animations
function setupAnimations() {
    // Fade in elements with the .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Create neuron network effect
function createNeuronEffect() {
    const container = document.getElementById('neuronBackground');
    if (!container) return;
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const neuronsCount = Math.min(100, Math.floor(width * height / 10000));
    
    for (let i = 0; i < neuronsCount; i++) {
        createNeuron(container, width, height);
    }
    
    connectNeurons(container);
}

// Create a single neuron
function createNeuron(container, width, height) {
    const neuron = document.createElement('div');
    neuron.className = 'neuron';
    
    // Random position
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    neuron.style.left = `${x}px`;
    neuron.style.top = `${y}px`;
    
    // Random size
    const size = 3 + Math.random() * 5;
    neuron.style.width = `${size}px`;
    neuron.style.height = `${size}px`;
    
    // Random pulse animation
    neuron.style.animationDuration = `${2 + Math.random() * 3}s`;
    neuron.style.animationDelay = `${Math.random() * 2}s`;
    
    container.appendChild(neuron);
}

// Connect neurons with synapses
function connectNeurons(container) {
    const neurons = container.querySelectorAll('.neuron');
    const neuronsArray = Array.from(neurons);
    
    neuronsArray.forEach((neuron, index) => {
        // Connect to 1-3 closest neurons
        const neuronsCount = neuronsArray.length;
        const connectionsCount = Math.min(neuronsCount - 1, 1 + Math.floor(Math.random() * 2));
        
        // Get neuron position
        const neuronX = parseFloat(neuron.style.left);
        const neuronY = parseFloat(neuron.style.top);
        
        // Find closest neurons
        const others = neuronsArray
            .filter(n => n !== neuron)
            .map(n => ({
                element: n,
                distance: Math.sqrt(
                    Math.pow(parseFloat(n.style.left) - neuronX, 2) + 
                    Math.pow(parseFloat(n.style.top) - neuronY, 2)
                )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, connectionsCount);
        
        // Create synapse connections
        others.forEach(other => {
            createSynapse(container, neuron, other.element);
        });
    });
}

// Create a synapse connection between two neurons
function createSynapse(container, neuron1, neuron2) {
    const synapse = document.createElement('div');
    synapse.className = 'synapse';
    
    // Calculate positions
    const x1 = parseFloat(neuron1.style.left) + parseFloat(neuron1.style.width) / 2;
    const y1 = parseFloat(neuron1.style.top) + parseFloat(neuron1.style.height) / 2;
    const x2 = parseFloat(neuron2.style.left) + parseFloat(neuron2.style.width) / 2;
    const y2 = parseFloat(neuron2.style.top) + parseFloat(neuron2.style.height) / 2;
    
    // Calculate length and angle
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    // Set synapse properties
    synapse.style.width = `${length}px`;
    synapse.style.left = `${x1}px`;
    synapse.style.top = `${y1}px`;
    synapse.style.transform = `rotate(${angle}deg)`;
    
    // Random animation
    synapse.style.animationDuration = `${2 + Math.random() * 4}s`;
    synapse.style.animationDelay = `${Math.random() * 2}s`;
    
    container.appendChild(synapse);
}
