<?php
/**
 * Plugin Name: Matthew Connector
 * Description: Parish registration and household management system connector
 * Version: 1.0.1
 * Author: Your Name
 * Requires at least: 6.0
 * Requires PHP: 8.2
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MATTHEW_CONNECTOR_VERSION', '1.0.6');
define('MATTHEW_CONNECTOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MATTHEW_CONNECTOR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Register activation hook
register_activation_hook(__FILE__, function() {
    // Create necessary database tables or options
    add_option('matthew_connector_api_url', '');
    add_option('matthew_connector_site_token', '');
});

// Load the plugin
require_once MATTHEW_CONNECTOR_PLUGIN_DIR . 'includes/class-matthew-connector.php';
