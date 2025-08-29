<?php

namespace MatthewConnector\Shortcodes;

use Matthew_API_Client;

class ParishPortal {
    private static function log_error($message, $context = []) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                '[Matthew Portal] %s: %s',
                $message,
                json_encode($context, JSON_PRETTY_PRINT)
            ));
        }
    }

    public static function init() {
        // Register shortcode
        add_shortcode('parish_portal', [self::class, 'render']);
        
        // Register scripts
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_assets']);
        
        // Register AJAX handlers
        // add_action('wp_ajax_matthew_register_household', [self::class, 'handle_registration']);
        // add_action('wp_ajax_nopriv_matthew_register_household', [self::class, 'handle_registration']);
        // add_action('wp_ajax_matthew_login_household', [self::class, 'handle_login']);
        // add_action('wp_ajax_nopriv_matthew_login_household', [self::class, 'handle_login']);
    }


    private static function handle_api_error($error, $default_message = 'An error occurred') {
        $debug = defined('WP_DEBUG') && WP_DEBUG;
        
        // Always log the full error
        if (is_wp_error($error)) {
            self::log_error($error->get_error_message(), [
                'code' => $error->get_error_code(),
                'data' => $error->get_error_data()
            ]);
        } else {
            self::log_error($error instanceof \Exception ? $error->getMessage() : print_r($error, true));
        }

        // Prepare the response
        $response = ['success' => false];
        
        if ($debug) {
            if (is_wp_error($error)) {
                $response['error'] = [
                    'message' => $error->get_error_message(),
                    'code' => $error->get_error_code(),
                    'data' => $error->get_error_data()
                ];
            } else if ($error instanceof \Exception) {
                $response['error'] = [
                    'message' => $error->getMessage(),
                    'code' => $error->getCode(),
                    'file' => $error->getFile(),
                    'line' => $error->getLine(),
                    'trace' => $error->getTraceAsString()
                ];
            } else {
                $response['error'] = [
                    'message' => print_r($error, true)
                ];
            }
        } else {
            $response['message'] = $default_message;
        }

        return $response;
    }

    public static function render($atts) {
        // Ensure assets are loaded
        self::enqueue_assets();
        
        ob_start();
        ?>
        <style>
        /* Auth Tab styles */
        .auth-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .auth-header h2 {
            margin: 0 0 15px 0;
            color: #333;
        }
        
        .auth-instructions {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 30px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .auth-tab-button {
            flex: 1;
            padding: 12px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            color: #666;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
        }
        
        .auth-tab-button:hover {
            color: #333;
            background-color: #f8f9fa;
        }
        
        .auth-tab-button.active {
            color: #0073aa;
            border-bottom-color: #0073aa;
            background-color: #f8f9fa;
        }
        
        .auth-tab-content {
            display: none;
        }
        
        .auth-tab-content.active {
            display: block;
        }
        
        .full-width {
            width: 100%;
        }
        
        /* Modal styles */
        .matthew-modal {
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .matthew-modal-content {
            background-color: #fff;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .matthew-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px 0;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
        }
        
        .matthew-modal-header h4 {
            margin: 0;
            color: #333;
            font-size: 1.25em;
        }
        
        .matthew-modal-close {
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            background: none;
            border: none;
        }
        
        .matthew-modal-close:hover {
            color: #000;
        }
        
        .matthew-modal-body {
            padding: 0 24px 24px;
        }
        
        /* Password toggle styles */
        .password-input-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .password-input-container input {
            padding-right: 40px;
        }
        
        .password-toggle {
            position: absolute;
            right: 12px;
            cursor: pointer;
            font-size: 16px;
            color: #666;
            user-select: none;
            z-index: 10;
            background: rgba(255, 255, 255, 0.8);
            padding: 4px;
            border-radius: 3px;
        }
        
        .password-toggle:hover {
            color: #333;
        }
        
        .password-toggle.hidden {
            opacity: 0.5;
        }
        
        /* Loading button styles */
        .matthew-portal-container button:disabled, 
        .matthew-portal-container input[type="submit"]:disabled {
            opacity: 0.7 !important;
            cursor: not-allowed !important;
            position: relative;
        }
        
        .matthew-portal-container button:disabled:hover, 
        .matthew-portal-container input[type="submit"]:disabled:hover {
            opacity: 0.7 !important;
        }
        
        .matthew-portal-container .loading-spinner {
            display: inline-block !important;
            width: 12px !important;
            height: 12px !important;
            border: 2px solid #ccc !important;
            border-top-color: #333 !important;
            border-radius: 50% !important;
            animation: spin 1s linear infinite !important;
            margin-right: 8px !important;
            vertical-align: middle !important;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
        
        <div id="matthew-parish-portal" class="matthew-portal-container">
            <!-- Login/Registration Forms (shown when not authenticated) -->
            <div id="auth-forms" class="auth-section">
                <div class="auth-header">
                    <p class="auth-instructions">
                        <strong>New to our parish?</strong> Register your household to get started.<br>
                        <strong>Already registered?</strong> Login with your email and password.
                    </p>
                </div>
                
                <div class="auth-tabs">
                    <button type="button" class="auth-tab-button active" data-tab="login">Login</button>
                    <button type="button" class="auth-tab-button" data-tab="register">Register</button>
                </div>
                
                <!-- Login Tab -->
                <div id="login-tab" class="auth-tab-content active">
                    <form id="parish-login-form" class="parish-form">
                        <div class="form-group">
                            <label for="login_email">Email Address</label>
                            <input type="email" id="login_email" name="login_email" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="login_password">Password</label>
                            <div class="password-input-container">
                                <input type="password" id="login_password" name="login_password" required autocomplete="current-password">
                                <span class="password-toggle" data-target="login_password">👁️</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary full-width">Login</button>
                        </div>
                        <div class="form-group text-center">
                            <a href="#" id="forgot-password-link">Forgot Password?</a>
                        </div>
                        <div id="login-message"></div>
                    </form>
                </div>
                
                <!-- Registration Tab -->
                <div id="register-tab" class="auth-tab-content">
                    <form id="parish-registration-form" class="parish-form">
                        <div class="form-group">
                            <label for="household_name">Household Name</label>
                            <input type="text" id="household_name" name="household_name" required 
                                   placeholder="e.g., Smith Family">
                        </div>
                        <div class="form-group">
                            <label for="primary_email">Email Address</label>
                            <input type="email" id="primary_email" name="primary_email" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="primary_phone">Phone Number</label>
                            <input type="tel" id="primary_phone" name="primary_phone" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-input-container">
                                <input type="password" id="password" name="password" required
                                       minlength="8" autocomplete="new-password">
                                <span class="password-toggle" data-target="password">👁️</span>
                            </div>
                            <small class="help-text">At least 8 characters</small>
                        </div>
                        <div class="form-group">
                            <label for="password_confirm">Confirm Password</label>
                            <div class="password-input-container">
                                <input type="password" id="password_confirm" name="password_confirm" required autocomplete="new-password">
                                <span class="password-toggle" data-target="password_confirm">👁️</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary full-width">Register Household</button>
                        </div>
                        <div id="registration-message"></div>
                    </form>
                </div>
            </div>

            <!-- Household Management (shown when authenticated) -->
            <div id="household-management" class="household-section" style="display: none;">
                <div class="household-header">
                    <h2 id="household-title"></h2>
                    <div class="household-actions">
                        <button type="button" id="logout-btn" class="button button-secondary">Logout</button>
                    </div>
                </div>

                <div class="management-tabs">
                    <button type="button" class="tab-button active" data-tab="household-info">Household Info</button>
                    <button type="button" class="tab-button" data-tab="members">Members</button>
                </div>

                <!-- Household Information Tab -->
                <div id="household-info-tab" class="tab-content active">
                    <form id="household-info-form" class="parish-form">
                        <h3>Household Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="household_name_edit">Household Name</label>
                                <input type="text" id="household_name_edit" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="household_phone_edit">Phone</label>
                                <input type="tel" id="household_phone_edit" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="household_email_edit">Email</label>
                                <input type="email" id="household_email_edit" name="email" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="household_address">Address</label>
                                <input type="text" id="household_address" name="address">
                            </div>
                            <div class="form-group">
                                <label for="household_city">City</label>
                                <input type="text" id="household_city" name="city">
                            </div>
                            <div class="form-group">
                                <label for="household_postal_code">Postal Code</label>
                                <input type="text" id="household_postal_code" name="postal_code">
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Update Household</button>
                        </div>
                        <div id="household-info-message"></div>
                    </form>
                </div>

                <!-- Members Tab -->
                <div id="members-tab" class="tab-content">
                    <div class="members-header">
                        <h3>Household Members</h3>
                        <button type="button" id="add-member-btn" class="button button-primary">Add Member</button>
                    </div>
                    
                    <div id="members-list" class="members-list">
                        <!-- Members will be loaded dynamically -->
                    </div>

                    <!-- Add/Edit Member Modal -->
                    <div id="member-form-modal" class="matthew-modal" style="display: none;">
                        <div class="matthew-modal-content">
                            <div class="matthew-modal-header">
                                <h4 id="member-form-title">Add New Member</h4>
                                <span class="matthew-modal-close">&times;</span>
                            </div>
                            <div class="matthew-modal-body">
                                <form id="member-form" class="parish-form">
                                    <input type="hidden" id="member_id" name="member_id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="member_first_name">First Name</label>
                                    <input type="text" id="member_first_name" name="first_name" required>
                                </div>
                                <div class="form-group">
                                    <label for="member_last_name">Last Name</label>
                                    <input type="text" id="member_last_name" name="last_name" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="member_email">Email</label>
                                    <input type="email" id="member_email" name="email">
                                </div>
                                <div class="form-group">
                                    <label for="member_phone">Phone</label>
                                    <input type="tel" id="member_phone" name="phone">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="member_occupation">Occupation</label>
                                    <input type="text" id="member_occupation" name="occupation">
                                </div>
                                <div class="form-group">
                                    <label for="member_skills">Skills</label>
                                    <input type="text" id="member_skills" name="skills">
                                </div>
                            </div>

                            <h5>Sacramental Information</h5>
                            <div class="sacraments-section">
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="member_baptised" name="baptised">
                                        Baptised
                                    </label>
                                </div>
                                <div id="baptism-details" style="display: none;">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="baptism_date">Baptism Date</label>
                                            <input type="date" id="baptism_date" name="baptism_date">
                                        </div>
                                        <div class="form-group">
                                            <label for="baptism_parish">Baptism Parish</label>
                                            <input type="text" id="baptism_parish" name="baptism_parish">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="baptism_certificate">Baptism Certificate</label>
                                            <input type="file" id="baptism_certificate" name="baptism_certificate" 
                                                   accept=".pdf,.jpg,.jpeg,.png" class="certificate-upload">
                                            <small class="help-text">Upload certificate (PDF, JPG, or PNG)</small>
                                            <div id="baptism_certificate_current" class="current-certificate" style="display: none;">
                                                <p>Current certificate: <a href="#" target="_blank" id="baptism_certificate_link"></a></p>
                                                <button type="button" class="button button-secondary remove-certificate" 
                                                        data-certificate-type="baptism">Remove Certificate</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="member_first_communion" name="first_communion">
                                        First Communion
                                    </label>
                                </div>
                                <div id="first-communion-details" style="display: none;">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="first_communion_date">First Communion Date</label>
                                            <input type="date" id="first_communion_date" name="first_communion_date">
                                        </div>
                                        <div class="form-group">
                                            <label for="first_communion_parish">First Communion Parish</label>
                                            <input type="text" id="first_communion_parish" name="first_communion_parish">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="first_communion_certificate">First Communion Certificate</label>
                                            <input type="file" id="first_communion_certificate" name="first_communion_certificate" 
                                                   accept=".pdf,.jpg,.jpeg,.png" class="certificate-upload">
                                            <small class="help-text">Upload certificate (PDF, JPG, or PNG)</small>
                                            <div id="first_communion_certificate_current" class="current-certificate" style="display: none;">
                                                <p>Current certificate: <a href="#" target="_blank" id="first_communion_certificate_link"></a></p>
                                                <button type="button" class="button button-secondary remove-certificate" 
                                                        data-certificate-type="first_communion">Remove Certificate</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="member_confirmed" name="confirmed">
                                        Confirmed
                                    </label>
                                </div>
                                <div id="confirmation-details" style="display: none;">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="confirmation_date">Confirmation Date</label>
                                            <input type="date" id="confirmation_date" name="confirmation_date">
                                        </div>
                                        <div class="form-group">
                                            <label for="confirmation_parish">Confirmation Parish</label>
                                            <input type="text" id="confirmation_parish" name="confirmation_parish">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="confirmation_certificate">Confirmation Certificate</label>
                                            <input type="file" id="confirmation_certificate" name="confirmation_certificate" 
                                                   accept=".pdf,.jpg,.jpeg,.png" class="certificate-upload">
                                            <small class="help-text">Upload certificate (PDF, JPG, or PNG)</small>
                                            <div id="confirmation_certificate_current" class="current-certificate" style="display: none;">
                                                <p>Current certificate: <a href="#" target="_blank" id="confirmation_certificate_link"></a></p>
                                                <button type="button" class="button button-secondary remove-certificate" 
                                                        data-certificate-type="confirmation">Remove Certificate</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="button button-primary">Save Member</button>
                                <button type="button" id="cancel-member-btn" class="button button-secondary">Cancel</button>
                            </div>
                            <div id="member-form-message"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function enqueue_assets() {
        $version = MATTHEW_CONNECTOR_VERSION ; // --- IGNORE ---
        $plugin_url = defined('MATTHEW_CONNECTOR_PLUGIN_URL') ? MATTHEW_CONNECTOR_PLUGIN_URL : plugin_dir_url(dirname(__DIR__));

        wp_enqueue_style(
            'matthew-parish-portal',
            $plugin_url . 'assets/css/parish-portal.css',
            [],
            $version . '-' . time() // Force cache bust
        );

        // Ensure jQuery is loaded
        wp_enqueue_script('jquery');
        
        // Enqueue modular JavaScript files in dependency order
        wp_enqueue_script(
            'parish-portal-utils',
            $plugin_url . 'assets/js/parish-portal-utils.js',
            ['jquery'],
            $version,
            true
        );
        
        wp_enqueue_script(
            'parish-portal-api',
            $plugin_url . 'assets/js/parish-portal-api.js',
            ['jquery', 'parish-portal-utils'],
            $version,
            true
        );
        
        wp_enqueue_script(
            'parish-portal-auth',
            $plugin_url . 'assets/js/parish-portal-auth.js',
            ['jquery', 'parish-portal-utils', 'parish-portal-api'],
            $version,
            true
        );
        
        wp_enqueue_script(
            'parish-portal-household',
            $plugin_url . 'assets/js/parish-portal-household.js',
            ['jquery', 'parish-portal-utils', 'parish-portal-api'],
            $version,
            true
        );
        
        wp_enqueue_script(
            'parish-portal-members',
            $plugin_url . 'assets/js/parish-portal-members.js',
            ['jquery', 'parish-portal-utils', 'parish-portal-api'],
            $version,
            true
        );
        
        wp_enqueue_script(
            'parish-portal-main',
            $plugin_url . 'assets/js/parish-portal-main.js',
            ['jquery', 'parish-portal-utils', 'parish-portal-api', 'parish-portal-auth', 'parish-portal-household', 'parish-portal-members'],
            $version,
            true
        );

        // Localize script for the main file
        wp_localize_script('parish-portal-main', 'parishPortalAjax', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('matthew_portal'),
            'debug' => defined('WP_DEBUG') && WP_DEBUG
        ]);
    }

    public static function handle_registration() {
        // Set proper content type for JSON response
        header('Content-Type: application/json');
        
        try {
            // Enable error logging for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_reporting(E_ALL);
                ini_set('display_errors', 1);
                ini_set('log_errors', 1);
                ini_set('error_log', WP_CONTENT_DIR . '/debug.log');
            }

            // Log the raw input for debugging
            $raw_input = file_get_contents('php://input');
            self::log_error('Received registration request', ['raw_input' => $raw_input]);

            // Verify nonce
            if (!check_ajax_referer('matthew_portal', 'nonce', false)) {
                throw new \Exception('Security check failed');
            }

            // Validate required fields
            $required_fields = ['household_name', 'email', 'phone', 'password'];
            $data = json_decode($raw_input, true) ?: [];

            // Log decoded data for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                self::log_error('Decoded registration data', ['data' => $data]);
            }

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON data received: ' . json_last_error_msg());
            }

            self::log_error('Parsed registration data', [
                'fields_received' => array_keys($data ?? []),
                'fields_required' => $required_fields
            ]);

            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    throw new \Exception("Missing required field: {$field}");
                }
            }

            // Validate email
            if (!is_email($data['email'])) {
                throw new \Exception('Invalid email address');
            }

            // Make API request
            $api_client = new Matthew_API_Client();

            // Log registration attempt (sensitive data removed)
            self::log_error('Attempting API request', [
                'endpoint' => 'api/household/register',
                'data' => array_diff_key($data, ['password' => true]) // Log data without password
            ]);

            $body = $api_client->post('api/household/register', $data);

            wp_send_json([
                'success' => true,
                'message' => 'Registration successful! You can now log in.',
                'data' => $body
            ]);

        } catch (\Exception $e) {
            $response = self::handle_api_error($e, 'Registration failed. Please try again.');
            $code = $e->getCode();
            wp_send_json($response, $code > 0 ? $code : 400);
        }
    }

    public static function handle_login() {
        // Set proper content type for JSON response
        header('Content-Type: application/json');
        
        try {
            // Verify nonce
            if (!check_ajax_referer('matthew_portal', 'nonce', false)) {
                throw new \Exception('Security check failed');
            }

            // Validate required fields
            $required_fields = ['email', 'password'];
            $data = json_decode(file_get_contents('php://input'), true);

            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    throw new \Exception("Missing required field: {$field}");
                }
            }

            // Make API request
            $api_client = new Matthew_API_Client();
            $body = $api_client->post('api/household/login', $data);

            wp_send_json([
                'success' => true,
                'message' => 'Login successful!',
                'data' => $body
            ]);

        } catch (\Exception $e) {
            $response = self::handle_api_error($e, 'Login failed. Please check your credentials and try again.');
            $code = $e->getCode();
            wp_send_json($response, $code > 0 ? $code : 400);
        }
    }
}
