/**
 * Parish Portal Utilities
 * Common utility functions for error handling, success messages, etc.
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    /**
     * Display error message
     */
    function displayError($messageElement, error) {
        let message = 'An unexpected error occurred. Please try again.';
        
        if (parishPortalAjax && parishPortalAjax.debug) {
            // In debug mode, show detailed error information
            if (error && error.responseJSON) {
                message = error.responseJSON.message || message;
                console.error('API Error Response:', error.responseJSON);
            } else if (error && error.message) {
                message = error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            console.error('Full error object:', error);
        } else {
            // In production, show user-friendly messages
            if (error && error.responseJSON && error.responseJSON.message) {
                message = error.responseJSON.message;
            } else if (error && error.message) {
                message = error.message;
            }
        }
        
        $messageElement.removeClass('success').addClass('error').html(message);
    }

    /**
     * Display success message
     */
    function displaySuccess($messageElement, message) {
        $messageElement.removeClass('error').addClass('success').html(message);
    }

    /**
     * Clear message
     */
    function clearMessage($messageElement) {
        $messageElement.removeClass('error success').html('');
    }

    /**
     * Show loading state on button
     */
    function setButtonLoading($button, loadingText) {
        console.log('Setting button loading state:', loadingText);
        console.log('Button object:', $button);
        console.log('Button length:', $button.length);
        console.log('Button element:', $button[0]);
        console.log('Button before:', $button.html());
        
        if ($button.length === 0) {
            console.error('Button not found! Cannot set loading state.');
            return;
        }
        
        $button.data('original-text', $button.text());
        $button.data('original-html', $button.html());
        $button.prop('disabled', true);
        
        // Add spinner and loading text (CSS is already in the main stylesheet)
        const spinnerHtml = '<span class="loading-spinner"></span>';
        const newHtml = spinnerHtml + loadingText;
        $button.html(newHtml);
        console.log('Button after:', $button.html());
        console.log('Button loading state applied');
    }

    /**
     * Reset button from loading state
     */
    function resetButton($button) {
        console.log('Resetting button from loading state');
        const originalText = $button.data('original-text');
        const originalHtml = $button.data('original-html');
        $button.prop('disabled', false);
        
        // Restore original content (text or HTML)
        if (originalHtml && originalHtml !== originalText) {
            $button.html(originalHtml);
        } else {
            $button.text(originalText);
        }
        console.log('Button reset completed');
    }

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Debounce function
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Export functions to global namespace
    window.ParishPortal.Utils = {
        displayError,
        displaySuccess,
        clearMessage,
        setButtonLoading,
        resetButton,
        formatDate,
        isValidEmail,
        debounce
    };

})(jQuery);
