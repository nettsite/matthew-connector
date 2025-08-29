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
            const $submitButton = $form.find('input[type="submit"]');
            const $message = $('#registration-message');
            
            // Validate password match
            const password = $('#password').val();
            const confirmPassword = $('#password_confirm').val();
            if (password !== confirmPassword) {
                window.ParishPortal.Utils.displayError($message, 'Passwords do not match');
                return;
            }
            
            // Show loading state
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Registering...');
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                // Prepare form data according to API spec
                const formData = {
                    household_name: $('#household_name').val(),
                    email: $('#primary_email').val(),
                    password: password,
                    phone: $('#primary_phone').val()
                };
                
                console.log('Submitting registration for:', formData.email);
                console.log('Full form data being sent:', formData);
                
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
            const $submitButton = $form.find('input[type="submit"]');
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
            
            // Clear any messages
            $('.message').removeClass('error success').empty();
            
            // Reset forms
            $('#parish-registration-form')[0].reset();
            $('#parish-login-form')[0].reset();
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
