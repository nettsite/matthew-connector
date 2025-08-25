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
        $button.data('original-text', $button.text());
        $button.prop('disabled', true).text(loadingText);
    }

    /**
     * Reset button from loading state
     */
    function resetButton($button) {
        const originalText = $button.data('original-text');
        $button.prop('disabled', false).text(originalText);
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
