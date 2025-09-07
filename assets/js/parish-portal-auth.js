/**
 * Parish Portal Authentication
 * Handles login, registration, and authentication state
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    /**
     * Show household management interface
     */
    function showHouseholdManagement() {
        console.log('Showing household management');
        $('.auth-section').removeClass('show').addClass('hide');
        $('.household-section').removeClass('hide').addClass('show');
    }

    /**
     * Show authentication forms
     */
    function showAuthForms() {
        console.log('Showing auth forms');
        $('.household-section').removeClass('show').addClass('hide');
        $('.auth-section').removeClass('hide').addClass('show');
    }

    /**
     * Check authentication status on page load
     */
    function checkAuthenticationStatus() {
        const token = window.ParishPortal.API.getToken();
        console.log('Checking authentication status, token exists:', !!token);
        
        if (token) {
            console.log('Token found, showing household management and loading data...');
            showHouseholdManagement();
            if (window.ParishPortal.Household) {
                window.ParishPortal.Household.loadHouseholdData();
            }
        } else {
            console.log('No token found, showing auth forms');
            showAuthForms();
        }
    }

    /**
     * Initialize auth tab switching functionality
     */
    function initAuthTabs() {
        $('.auth-tab-button').off('click').on('click', function() {
            const tabId = $(this).data('tab');
            
            // Update tab buttons
            $('.auth-tab-button').removeClass('active');
            $(this).addClass('active');
            
            // Update tab content
            $('.auth-tab-content').removeClass('active');
            $('#' + tabId + '-tab').addClass('active');
        });
    }

    /**
     * Initialize password toggle functionality
     */
    function initPasswordToggle() {
        $(document).on('click', '.password-toggle', function(e) {
            e.preventDefault();
            
            const $icon = $(this);
            const targetId = $icon.data('target');
            const $input = $('#' + targetId);
            
            if ($input.attr('type') === 'password') {
                $input.attr('type', 'text');
                $icon.text('🙈');
            } else {
                $input.attr('type', 'password');
                $icon.text('👁️');
            }
        });
    }

    /**
     * Initialize registration form
     */
    function initRegistrationForm() {
        $('#parish-registration-form').off('submit').on('submit', async function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"], input[type="submit"]');
            const $message = $('#registration-message');
            
            // Validate password match
            const password = $('#password').val();
            const confirmPassword = $('#password_confirm').val();
            if (password !== confirmPassword) {
                window.ParishPortal.Utils.displayError($message, 'Passwords do not match');
                return;
            }
            
            // Validate terms acceptance
            const termsAccepted = $('#terms_accepted').prop('checked');
            if (!termsAccepted) {
                window.ParishPortal.Utils.displayError($message, 'You must agree to the Terms & Conditions and Privacy Policy');
                return;
            }
            
            // Show loading state
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Registering...');
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                // Prepare form data according to API spec - FIXED VERSION
                const formData = {
                    household_name: $('#household_name').val(),
                    email: $('#primary_email').val(),
                    password: password,
                    phone: $('#primary_phone').val(),
                    terms_accepted: 1
                };
                console.log('DEBUG: Submitting registration for:', formData.email);
                console.log('DEBUG: Full form data being sent:', formData);
                console.log('DEBUG: FormData keys:', Object.keys(formData));
                console.log('DEBUG: terms_accepted field specifically:', formData.terms_accepted);
                console.log('Terms checkbox checked:', termsAccepted);
                console.log('Terms checkbox element:', $('#terms_accepted'));
                
                const response = await window.ParishPortal.API.register(formData);
                
                console.log('Registration response:', response);
                
                if (response.success && response.data && response.data.token) {
                    // Store the household token securely
                    window.ParishPortal.API.setToken(response.data.token);
                    
                    // Store household data
                    if (window.ParishPortal.Household) {
                        window.ParishPortal.Household.setCurrentHouseholdData(response.data.household);
                    }
                    
                    // Show household management interface
                    showHouseholdManagement();
                    
                    // Show success message briefly
                    window.ParishPortal.Utils.displaySuccess($message, 'Registration successful! Welcome!');
                    
                    // Load household data
                    if (window.ParishPortal.Household) {
                        await window.ParishPortal.Household.loadHouseholdData();
                    }
                    
                    $form[0].reset();
                } else {
                    throw new Error(response.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });
    }

    /**
     * Initialize login form
     */
    function initLoginForm() {
        $('#parish-login-form').off('submit').on('submit', async function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"], input[type="submit"]');
            const $message = $('#login-message');
            
            // Show loading state
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Logging in...');
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                // Collect form data
                const credentials = {
                    email: $('#login_email').val(),
                    password: $('#login_password').val()
                };
                
                console.log('Submitting login for:', credentials.email);
                
                const response = await window.ParishPortal.API.login(credentials);
                
                console.log('Login response:', response);
                
                if (response.success && response.data && response.data.token) {
                    // Store the household token
                    window.ParishPortal.API.setToken(response.data.token);
                    
                    // Store household data
                    if (window.ParishPortal.Household) {
                        window.ParishPortal.Household.setCurrentHouseholdData(response.data.household);
                    }
                    
                    // Show household management interface
                    showHouseholdManagement();
                    
                    // Show success message
                    window.ParishPortal.Utils.displaySuccess($message, 'Login successful! Loading your information...');
                    
                    // Load household data
                    if (window.ParishPortal.Household) {
                        await window.ParishPortal.Household.loadHouseholdData();
                    }
                    
                    $form[0].reset();
                } else {
                    throw new Error(response.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });
    }

    /**
     * Initialize forgot password functionality
     */
    function initForgotPassword() {
        // Handle forgot password link click
        $(document).on('click', '#forgot-password-link', function(e) {
            e.preventDefault();
            $('#forgot-password-modal').show();
            $('#forgot-password-form-section').show();
            $('#reset-password-form-section').hide();
            
            // Pre-fill email if available
            const loginEmail = $('#login_email').val();
            if (loginEmail) {
                $('#forgot_email').val(loginEmail);
            }
        });

        // Handle modal close button only
        $(document).on('click', '#forgot-password-modal .matthew-modal-close', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#forgot-password-modal').hide();
        });

        // Handle modal backdrop click (clicking outside modal content)
        $(document).on('click', '#forgot-password-modal', function(e) {
            if (e.target === this) {
                $('#forgot-password-modal').hide();
            }
        });

        // Prevent modal from closing when clicking inside modal content
        $(document).on('click', '#forgot-password-modal .matthew-modal-content', function(e) {
            e.stopPropagation();
        });

        // Prevent modal from closing on form interactions
        $(document).on('click focus blur keydown keyup input', '#forgot-password-modal input, #forgot-password-modal button, #forgot-password-modal form', function(e) {
            e.stopPropagation();
        });

        // Handle ESC key to close modal
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#forgot-password-modal').is(':visible')) {
                $('#forgot-password-modal').hide();
            }
        });

        // Handle forgot password form submission
        $(document).off('submit', '#forgot-password-form').on('submit', '#forgot-password-form', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"]');
            const $message = $('#forgot-password-message');
            
            // Show loading state
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Sending...');
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                const email = $('#forgot_email').val();
                const resetUrl = window.location.origin + window.location.pathname;
                console.log('Requesting password reset for:', email);
                console.log('Reset URL:', resetUrl);
                
                const response = await window.ParishPortal.API.forgotPassword({ 
                    email: email,
                    reset_url: resetUrl 
                });
                
                console.log('Forgot password response:', response);
                
                if (response.success) {
                    window.ParishPortal.Utils.displaySuccess($message, response.message || 'Password reset link sent to your email.');
                    $form[0].reset();
                } else {
                    throw new Error(response.message || 'Failed to send reset link');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });

        // Handle reset password form submission
        $(document).off('submit', '#reset-password-form').on('submit', '#reset-password-form', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"]');
            const $message = $('#reset-password-message');
            
            // Validate password match
            const password = $('#new_password').val();
            const confirmPassword = $('#confirm_new_password').val();
            if (password !== confirmPassword) {
                window.ParishPortal.Utils.displayError($message, 'Passwords do not match');
                // Focus on the confirm password field for correction
                $('#confirm_new_password').focus();
                return;
            }
            
            // Validate password length
            if (password.length < 8) {
                window.ParishPortal.Utils.displayError($message, 'Password must be at least 8 characters long');
                $('#new_password').focus();
                return;
            }
            
            // Show loading state
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Resetting...');
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                const resetData = {
                    token: $('#reset_token').val(),
                    email: $('#reset_email').val(),
                    password: password,
                    password_confirmation: confirmPassword
                };
                
                console.log('Resetting password for:', resetData.email);
                
                const response = await window.ParishPortal.API.resetPassword(resetData);
                
                console.log('Reset password response:', response);
                
                if (response.success) {
                    window.ParishPortal.Utils.displaySuccess($message, response.message || 'Password reset successfully. You can now login with your new password.');
                    
                    // Clear URL parameters to prevent reopening modal on refresh
                    const url = new URL(window.location);
                    url.searchParams.delete('token');
                    url.searchParams.delete('email');
                    window.history.replaceState({}, document.title, url);
                    
                    // Close modal after a brief delay
                    setTimeout(() => {
                        $('#forgot-password-modal').hide();
                        // Focus on login form
                        $('#login_email').focus();
                    }, 2000);
                } else {
                    throw new Error(response.message || 'Failed to reset password');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
                
                // If token is invalid/expired, clear URL parameters so modal doesn't reopen
                if (error.responseJSON && (error.responseJSON.message || '').includes('expired')) {
                    const url = new URL(window.location);
                    url.searchParams.delete('token');
                    url.searchParams.delete('email');
                    window.history.replaceState({}, document.title, url);
                }
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });

        // Handle reset token from URL (if user clicks email link)
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');
        const resetEmail = urlParams.get('email');
        
        if (resetToken && resetEmail) {
            // Show reset password form
            $('#forgot-password-modal').show();
            $('#forgot-password-form-section').hide();
            $('#reset-password-form-section').show();
            $('#reset_token').val(resetToken);
            $('#reset_email').val(resetEmail);
        }
    }

    /**
     * Initialize logout functionality
     */
    function initLogout() {
        $(document).on('click', '#logout-btn', async function(e) {
            e.preventDefault();
            
            try {
                await window.ParishPortal.API.logout();
                console.log('Logout successful');
            } catch (error) {
                console.error('Logout error:', error);
                // Continue with local logout even if API call fails
            }
            
            // Clear household data
            if (window.ParishPortal.Household) {
                window.ParishPortal.Household.clearHouseholdData();
            }
            
            // Show auth forms
            showAuthForms();
            
            // Clear any messages from all possible message containers
            $('.message').removeClass('error success').empty();
            $('#login-message').removeClass('error success').empty();
            $('#registration-message').removeClass('error success').empty();
            $('#household-info-message').removeClass('error success').empty();
            $('#member-form-message').removeClass('error success').empty();
            
            // Reset forms safely
            const regForm = $('#parish-registration-form');
            if (regForm.length > 0) {
                regForm[0].reset();
            }
            
            const loginForm = $('#parish-login-form');
            if (loginForm.length > 0) {
                loginForm[0].reset();
            }
        });
    }

    /**
     * Initialize all authentication functionality
     */
    function init() {
        initAuthTabs();
        initPasswordToggle();
        initRegistrationForm();
        initLoginForm();
        initForgotPassword();
        initLogout();
        checkAuthenticationStatus();
    }

    // Export functions to global namespace
    window.ParishPortal.Auth = {
        init,
        checkAuthenticationStatus,
        showHouseholdManagement,
        showAuthForms,
        initAuthTabs,
        initPasswordToggle,
        initRegistrationForm,
        initLoginForm,
        initLogout
    };

})(jQuery);
