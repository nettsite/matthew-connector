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
        add_action('wp_ajax_matthew_register_household', [self::class, 'handle_registration']);
        add_action('wp_ajax_nopriv_matthew_register_household', [self::class, 'handle_registration']);
        add_action('wp_ajax_matthew_login_household', [self::class, 'handle_login']);
        add_action('wp_ajax_nopriv_matthew_login_household', [self::class, 'handle_login']);
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
        <div id="matthew-parish-portal" class="matthew-portal-container">
            <!-- Login/Registration Forms (shown when not authenticated) -->
            <div id="auth-forms" class="auth-section">
                <div class="matthew-portal-column">
                    <form id="parish-login-form" class="parish-form">
                        <h2>Login to Your Household</h2>
                        <div class="form-group">
                            <label for="login_email">Email Address</label>
                            <input type="email" id="login_email" name="login_email" required>
                        </div>
                        <div class="form-group">
                            <label for="login_password">Password</label>
                            <input type="password" id="login_password" name="login_password" required autocomplete="current-password">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Login</button>
                        </div>
                        <div class="form-group text-center">
                            <a href="#" id="forgot-password-link">Forgot Password?</a>
                        </div>
                        <div id="login-message"></div>
                    </form>
                </div>
                
                <div class="matthew-portal-column">
                    <form id="parish-registration-form" class="parish-form">
                        <h2>Register New Household</h2>
                        <div class="form-group">
                            <label for="household_name">Household Name</label>
                            <input type="text" id="household_name" name="household_name" required 
                                   placeholder="e.g., Smith Family">
                        </div>
                        <div class="form-group">
                            <label for="primary_email">Email Address</label>
                            <input type="email" id="primary_email" name="primary_email" required>
                        </div>
                        <div class="form-group">
                            <label for="primary_phone">Phone Number</label>
                            <input type="tel" id="primary_phone" name="primary_phone" required
                                   placeholder="(123) 456-7890">
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required
                                   minlength="8" autocomplete="new-password">
                            <small class="help-text">At least 8 characters</small>
                        </div>
                        <div class="form-group">
                            <label for="password_confirm">Confirm Password</label>
                            <input type="password" id="password_confirm" name="password_confirm" required autocomplete="new-password">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Register Household</button>
                        </div>
                        <div id="registration-message"></div>
                    </form>
                </div>
            </div>

            <!-- Household Management (shown when authenticated) -->
            <div id="household-management" class="household-section" style="display: none;">
                <div class="household-header">
                    <h2 id="household-title">Household Management</h2>
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
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="household_address">Address</label>
                                <input type="text" id="household_address" name="address">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="household_city">City</label>
                                <input type="text" id="household_city" name="city">
                            </div>
                            <div class="form-group">
                                <label for="household_province">Province</label>
                                <input type="text" id="household_province" name="province" placeholder="ON">
                            </div>
                            <div class="form-group">
                                <label for="household_postal_code">Postal Code</label>
                                <input type="text" id="household_postal_code" name="postal_code" placeholder="K1A 0B1">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="household_phone_edit">Phone</label>
                                <input type="tel" id="household_phone_edit" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="household_email_edit">Email</label>
                                <input type="email" id="household_email_edit" name="email" required>
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

                    <!-- Add/Edit Member Form (initially hidden) -->
                    <div id="member-form-container" style="display: none;">
                        <form id="member-form" class="parish-form">
                            <h4 id="member-form-title">Add New Member</h4>
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
                                </div>

                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="member_first_communion" name="first_communion">
                                        First Communion
                                    </label>
                                </div>

                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="member_confirmed" name="confirmed">
                                        Confirmed
                                    </label>
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
        <?php
        return ob_get_clean();
    }

    public static function enqueue_assets() {
        $version = defined('MATTHEW_CONNECTOR_VERSION') ? MATTHEW_CONNECTOR_VERSION : '1.0.1';
        $plugin_url = defined('MATTHEW_CONNECTOR_PLUGIN_URL') ? MATTHEW_CONNECTOR_PLUGIN_URL : plugin_dir_url(dirname(__DIR__));

        wp_enqueue_style(
            'matthew-parish-portal',
            $plugin_url . 'assets/css/parish-portal.css',
            [],
            $version . '-' . time() // Force cache bust
        );

        // Ensure jQuery is loaded
        wp_enqueue_script('jquery');
        
        wp_enqueue_script(
            'matthew-parish-portal',
            $plugin_url . 'assets/js/parish-portal.js',
            ['jquery'],
            $version,
            true
        );

        // Don't set JSON content type globally - we'll set it in our AJAX handlers
        wp_localize_script('matthew-parish-portal', 'matthewPortalSettings', [
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
            $required_fields = ['household_name', 'primary_email', 'primary_phone', 'password'];
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
            if (!is_email($data['primary_email'])) {
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
