// Main JavaScript file for Empathy Soul

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log("Empathy Soul application initialized");
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Setup animations
    setupAnimations();
    
    // Handle forms
    setupForms();
    
    // Add active state to current navigation
    highlightCurrentNav();
    
    // Setup dashboard interactions if on dashboard page
    if (document.querySelector('.dashboard-container')) {
        setupDashboardInteractions();
    }
    
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
    const inputs = form.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Clear previous errors
        const parentGroup = input.closest('.form-group');
        const errorElement = parentGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        
        // Validate required fields
        if (input.hasAttribute('required') && !input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        }
        
        // Validate email format
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                showError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Validate password length
        if (input.type === 'password' && input.value.trim() && 
            (input.id === 'password' || input.id === 'new-password')) {
            if (input.value.length < 8) {
                showError(input, 'Password must be at least 8 characters long');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show error message
function showError(input, message) {
    const parentGroup = input.closest('.form-group');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    parentGroup.appendChild(errorMessage);
    
    input.style.borderColor = 'var(--secondary-color)';
    
    // Focus the first input with error
    input.focus();
}

// Setup animations
function setupAnimations() {
    // Fade in elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '1';
        }, 100 * index);
    });
}

// Highlight current navigation item
function highlightCurrentNav() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

// Setup dashboard interactions
function setupDashboardInteractions() {
    console.log("Setting up dashboard interactions");
    
    // Make dashboard cards clickable
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add a subtle animation when clicked
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // If the card has a data-action attribute, perform that action
            const action = this.getAttribute('data-action');
            if (action) {
                console.log(`Performing action: ${action}`);
                
                // Example actions
                switch(action) {
                    case 'journal':
                        window.location.href = '/journal';
                        break;
                    case 'resources':
                        window.location.href = '/resources';
                        break;
                    case 'settings':
                        window.location.href = '/settings';
                        break;
                }
            }
        });
    });
    
    // Setup emotion tracking if that section exists
    const emotionTracker = document.getElementById('emotion-tracker');
    if (emotionTracker) {
        const emotionButtons = emotionTracker.querySelectorAll('.emotion-btn');
        
        emotionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                emotionButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // You could add code here to send the selected emotion to the server
                const emotion = this.getAttribute('data-emotion');
                console.log(`Selected emotion: ${emotion}`);
            });
        });
    }
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
