// AI Companion Interface Loader

document.addEventListener('DOMContentLoaded', function() {
    const loadingContainer = document.getElementById('loadingContainer');
    const errorContainer = document.getElementById('errorContainer');
    const iframeContainer = document.getElementById('iframeContainer');
    const aiCompanionFrame = document.getElementById('aiCompanionFrame');
    
    // State management for loading
    const loadingState = {
        isLoading: true,
        hasError: false,
        errorMessage: '',
        retryCount: 0,
        maxRetries: 3
    };
    
    // Function to update UI based on current state
    function updateUI() {
        if (loadingState.isLoading) {
            loadingContainer.style.display = 'flex';
            errorContainer.style.display = 'none';
            iframeContainer.style.display = 'none';
        } else if (loadingState.hasError) {
            loadingContainer.style.display = 'none';
            errorContainer.style.display = 'block';
            iframeContainer.style.display = 'none';
            
            // Update error message
            document.getElementById('errorMessage').textContent = loadingState.errorMessage;
            document.getElementById('retryCount').textContent = `Attempt ${loadingState.retryCount}/${loadingState.maxRetries}`;
            
            // Disable retry button if max retries reached
            const retryButton = document.getElementById('retryButton');
            if (loadingState.retryCount >= loadingState.maxRetries) {
                retryButton.disabled = true;
                retryButton.classList.add('disabled');
            } else {
                retryButton.disabled = false;
                retryButton.classList.remove('disabled');
            }
        } else {
            // Success state
            loadingContainer.style.display = 'none';
            errorContainer.style.display = 'none';
            iframeContainer.style.display = 'block';
            
            // Add class for smooth transition
            iframeContainer.classList.add('fade-in');
        }
    }
    
    // Function to handle errors
    function handleError(message) {
        loadingState.isLoading = false;
        loadingState.hasError = true;
        loadingState.errorMessage = message;
        updateUI();
    }
    
    // Function to handle successful load
    function handleSuccess() {
        loadingState.isLoading = false;
        loadingState.hasError = false;
        updateUI();
    }
    
    // Function to retry loading
    window.retryLoading = function() {
        if (loadingState.retryCount < loadingState.maxRetries) {
            loadingState.retryCount++;
            loadingState.isLoading = true;
            loadingState.hasError = false;
            updateUI();
            
            // Reload the iframe
            const src = aiCompanionFrame.src;
            aiCompanionFrame.src = '';
            
            setTimeout(function() {
                aiCompanionFrame.src = src;
            }, 300);
        }
    };
    
    // Handle iframe load event
    aiCompanionFrame.onload = function() {
        // Check if the iframe loaded successfully by trying to access its content
        try {
            // Add a delay for smooth transition
            setTimeout(function() {
                handleSuccess();
            }, 1000);
        } catch (e) {
            handleError('Unable to access the AI Companion interface due to browser security restrictions. Try accessing it directly.');
        }
    };
    
    // Handle iframe error
    aiCompanionFrame.onerror = function() {
        handleError('Failed to load the AI Companion interface. Please check your connection and try again.');
    };
    
    // Set a timeout to detect if loading takes too long
    const loadingTimeout = setTimeout(function() {
        if (loadingState.isLoading) {
            handleError('Loading is taking longer than expected. The resource might be unavailable.');
        }
    }, 15000); // 15 seconds timeout
    
    // Initial UI update to show loading state
    updateUI();
    
    // Record analytics for page visit
    try {
        if (typeof analytics !== 'undefined') {
            analytics.track('AI Companion Loaded', {
                timestamp: new Date().toISOString(),
                page: 'ai-companion'
            });
        }
    } catch (e) {
        console.log('Analytics not available');
    }
});
