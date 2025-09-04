<?php
if (!defined('ABSPATH')) {
    exit;
}

// Save settings if form is submitted
if (isset($_POST['matthew_connector_settings'])) {
    check_admin_referer('matthew_connector_settings');
    
    update_option('matthew_connector_api_url', sanitize_text_field($_POST['api_url']));
    update_option('matthew_connector_site_token', sanitize_text_field($_POST['site_token']));
    update_option('matthew_connector_parish_name', sanitize_text_field($_POST['parish_name']));
    update_option('matthew_connector_parish_phone', sanitize_text_field($_POST['parish_phone']));
    update_option('matthew_connector_parish_email', sanitize_email($_POST['parish_email']));
    update_option('matthew_connector_parish_address', sanitize_textarea_field($_POST['parish_address']));
    update_option('matthew_connector_jurisdiction', sanitize_text_field($_POST['jurisdiction']));
    
    echo '<div class="updated"><p>Settings saved.</p></div>';
}

// Get current values
$api_url = get_option('matthew_connector_api_url');
$site_token = get_option('matthew_connector_site_token');
$parish_name = get_option('matthew_connector_parish_name');
$parish_phone = get_option('matthew_connector_parish_phone');
$parish_email = get_option('matthew_connector_parish_email');
$parish_address = get_option('matthew_connector_parish_address');
$jurisdiction = get_option('matthew_connector_jurisdiction');
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

        <h2>Parish Information</h2>
        <p>This information will be used in the legal documents (Privacy Policy and Terms & Conditions).</p>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="parish_name">Parish Name</label>
                </th>
                <td>
                    <input type="text" name="parish_name" id="parish_name" value="<?php echo esc_attr($parish_name); ?>" class="regular-text">
                    <p class="description">Full name of your parish (e.g., "St. Mary's Catholic Church")</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="parish_phone">Parish Phone</label>
                </th>
                <td>
                    <input type="tel" name="parish_phone" id="parish_phone" value="<?php echo esc_attr($parish_phone); ?>" class="regular-text">
                    <p class="description">Main contact phone number</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="parish_email">Parish Email</label>
                </th>
                <td>
                    <input type="email" name="parish_email" id="parish_email" value="<?php echo esc_attr($parish_email); ?>" class="regular-text">
                    <p class="description">Main contact email for privacy and legal inquiries</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="parish_address">Parish Address</label>
                </th>
                <td>
                    <textarea name="parish_address" id="parish_address" rows="4" class="large-text"><?php echo esc_textarea($parish_address); ?></textarea>
                    <p class="description">Complete mailing address of the parish</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="jurisdiction">Legal Jurisdiction</label>
                </th>
                <td>
                    <input type="text" name="jurisdiction" id="jurisdiction" value="<?php echo esc_attr($jurisdiction); ?>" class="regular-text">
                    <p class="description">Legal jurisdiction for disputes (e.g., "State of California" or "Province of Ontario")</p>
                </td>
            </tr>
        </table>
        
        <?php submit_button('Save Settings'); ?>
    </form>
</div>
