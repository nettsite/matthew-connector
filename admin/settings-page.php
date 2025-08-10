<?php
if (!defined('ABSPATH')) {
    exit;
}

// Save settings if form is submitted
if (isset($_POST['matthew_connector_settings'])) {
    check_admin_referer('matthew_connector_settings');
    
    update_option('matthew_connector_api_url', sanitize_text_field($_POST['api_url']));
    update_option('matthew_connector_site_token', sanitize_text_field($_POST['site_token']));
    
    echo '<div class="updated"><p>Settings saved.</p></div>';
}

// Get current values
$api_url = get_option('matthew_connector_api_url');
$site_token = get_option('matthew_connector_site_token');
?>

<div class="wrap">
    <h1>Matthew Connector Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('matthew_connector_settings'); ?>
        <input type="hidden" name="matthew_connector_settings" value="1">
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="api_url">API URL</label>
                </th>
                <td>
                    <input type="url" name="api_url" id="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text">
                    <p class="description">Enter the URL of your Laravel API (e.g., https://api.example.com)</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="site_token">Site Token</label>
                </th>
                <td>
                    <input type="password" name="site_token" id="site_token" value="<?php echo esc_attr($site_token); ?>" class="regular-text">
                    <p class="description">Enter your Sanctum API token for site-level access</p>
                </td>
            </tr>
        </table>
        
        <?php submit_button('Save Settings'); ?>
    </form>
</div>
