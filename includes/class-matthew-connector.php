<?php

class Matthew_Connector {
    private static $instance = null;
    private $api_url;
    private $site_token;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Get and sanitize API configuration
        $this->api_url = esc_url_raw(get_option('matthew_connector_api_url'));
        $this->site_token = sanitize_text_field(get_option('matthew_connector_site_token'));

        // Show admin notice if configuration is missing
        if (empty($this->api_url) || empty($this->site_token)) {
            add_action('admin_notices', function() {
                if (!current_user_can('manage_options')) return;
                ?>
                <div class="notice notice-warning is-dismissible">
                    <p><?php _e('Matthew Connector requires configuration. Please visit the <a href="' . 
                        esc_url(admin_url('admin.php?page=matthew-connector')) . 
                        '">settings page</a> to set up the API URL and site token.', 'matthew-connector'); ?></p>
                </div>
                <?php
            });
        }

        // Register hooks
        add_action('init', array($this, 'init'));
        add_action('graphql_register_types', array($this, 'register_graphql_types'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }

    public function init() {
        // Initialize the plugin
        $this->load_dependencies();
        
        // Register AJAX handlers
        add_action('wp_ajax_matthew_get_api_config', array($this, 'handle_get_api_config'));
        add_action('wp_ajax_nopriv_matthew_get_api_config', array($this, 'handle_get_api_config'));
    }

    /**
     * Handle AJAX request for Matthew API configuration
     */
    public function handle_get_api_config() {
        // Set JSON content type
        header('Content-Type: application/json');

        try {
            // Verify nonce
            if (!check_ajax_referer('matthew_portal_nonce', 'nonce', false)) {
                throw new \Exception('Security check failed', 403);
            }

            // Verify configuration exists
            if (empty($this->api_url) || empty($this->site_token)) {
                throw new \Exception('Plugin not properly configured. Please set the API URL and site token in the WordPress admin.', 500);
            }

            // Only send the API URL to the client, token stays server-side
            wp_send_json_success(array(
                'apiUrl' => rtrim($this->api_url, '/'),
                'endpoints' => array(
                    'register' => '/api/household/register',
                    'login' => '/api/household/login',
                    'logout' => '/api/household/logout',
                    'household' => '/api/household',
                    'members' => '/api/household/members',
                    'member' => '/api/members'
                )
            ));
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 400;
            wp_send_json_error(
                array(
                    'message' => $e->getMessage(),
                    'code' => $code
                ),
                $code
            );
        }
    }

    private function load_dependencies() {
        require_once MATTHEW_CONNECTOR_PLUGIN_DIR . 'includes/rest/class-matthew-api-client.php';
        require_once MATTHEW_CONNECTOR_PLUGIN_DIR . 'includes/shortcodes/class-parish-portal.php';
        
        // Initialize shortcodes
        \MatthewConnector\Shortcodes\ParishPortal::init();
    }


    public function enqueue_scripts() {
        // Scripts are now handled by the Parish Portal class to avoid duplication
        // This method is kept for backwards compatibility but does nothing
    }

    public function add_admin_menu() {
        add_menu_page(
            'Matthew Connector Settings',
            'Matthew Settings',
            'manage_options',
            'matthew-connector',
            array($this, 'render_admin_page'),
            'dashicons-admin-generic'
        );
    }

    public function render_admin_page() {
        include MATTHEW_CONNECTOR_PLUGIN_DIR . 'admin/settings-page.php';
    }
}

// Initialize the plugin
Matthew_Connector::instance();
