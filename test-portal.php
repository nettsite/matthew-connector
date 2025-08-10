<?php
/**
 * Test page for the Matthew Connector Portal
 * 
 * This is a standalone test page to demonstrate the parish portal functionality.
 * To use this, you can either:
 * 1. Add [parish_portal] shortcode to any WordPress page/post
 * 2. Access this file directly via yoursite.com/wp-content/plugins/matthew-connector/test-portal.php
 */

// Load WordPress
require_once('../../../wp-load.php');

// Ensure plugin is loaded
if (!function_exists('matthew_connector_init')) {
    wp_die('Matthew Connector plugin is not active. Please activate the plugin first.');
}

// Check if plugin is configured
$api_url = get_option('matthew_connector_api_url');
$site_token = get_option('matthew_connector_site_token');
$is_configured = !empty($api_url) && !empty($site_token);

if (!$is_configured) {
    wp_die('Matthew Connector plugin is not configured. Please configure the API URL and site token in WordPress admin.');
}

get_header();
?>

<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h1>Matthew Connector - Household Management Portal Test</h1>
    
    <div class="test-info" style="background: #f9f9f9; padding: 20px; margin-bottom: 30px; border-radius: 5px;">
        <h2>How to Test the Portal</h2>
        <ol>
            <li><strong>Registration:</strong> Fill out the registration form with your household information</li>
            <li><strong>Login:</strong> Use your email and password to log in</li>
            <li><strong>Household Management:</strong> After login, you'll see the household management interface with tabs for:
                <ul>
                    <li>Household Info - Edit your household details</li>
                    <li>Members - Add, edit, and delete household members</li>
                </ul>
            </li>
        </ol>
        
        <h3>Features to Test</h3>
        <ul>
            <li>✅ Responsive design (desktop, tablet, mobile)</li>
            <li>✅ Form validation and error handling</li>
            <li>✅ Member management with sacrament tracking</li>
            <li>✅ Persistent login (page refresh maintains session)</li>
            <li>✅ Logout functionality</li>
        </ul>
    </div>
    
    <!-- The Parish Portal Shortcode -->
    <?php echo do_shortcode('[parish_portal]'); ?>
    
    <div class="debug-info" style="background: #e7f3ff; padding: 20px; margin-top: 30px; border-radius: 5px;">
        <h3>Debug Information</h3>
        <p><strong>Plugin Status:</strong> <?php echo $plugin->is_configured() ? '✅ Configured' : '❌ Not Configured'; ?></p>
        <p><strong>API URL:</strong> <?php echo esc_html($plugin->get_api_url() ?: 'Not set'); ?></p>
        <p><strong>WordPress Debug:</strong> <?php echo WP_DEBUG ? '✅ Enabled' : '❌ Disabled'; ?></p>
        
        <?php if (WP_DEBUG): ?>
        <p><em>Check your WordPress debug.log for detailed error messages during testing.</em></p>
        <?php endif; ?>
    </div>
</div>

<style>
/* Additional test page styles */
.container h1 {
    color: #333;
    text-align: center;
    margin-bottom: 20px;
}

.test-info h2, .test-info h3 {
    color: #555;
    margin-top: 0;
}

.test-info ul, .test-info ol {
    margin-left: 20px;
}

.debug-info {
    font-family: monospace;
    font-size: 14px;
}
</style>

<?php
get_footer();
?>
