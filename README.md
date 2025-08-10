# Matthew Connector WordPress Plugin

This plugin connects your WordPress site to the Matthew parish management system, allowing parishioners to register households and manage their household members through your WordPress website.

## Features

- Household registration through WordPress
- Member management within households
- Secure authentication using Laravel Sanctum (household-based authentication)
- REST API integration with Laravel backend
- Session-based token management for households

## Requirements

- WordPress 6.0 or higher
- PHP 8.2 or higher
- Matthew parish management system (Laravel backend)
- HTTPS enabled (recommended for security)

## Installation

1. Download the plugin zip file
2. Go to WordPress admin → Plugins → Add New → Upload Plugin
3. Upload the zip file and activate the plugin
4. Configure the plugin settings

## Configuration

1. In WordPress admin, go to "Matthew Settings"
2. Enter your Laravel API URL (e.g., https://api.yourparish.com)
3. Enter your site-level Sanctum token (obtain this from your Laravel backend)

### Obtaining a Site Token

In your Laravel backend, run the following command to generate a site token:

```bash
php artisan tinker
$household = \App\Models\Household::first(); 
$household = \App\Models\Household::find(21); # Or specify an admin household
$token = $household->createToken('wordpress-site-token')->plainTextToken;
echo $token;
```

## Usage

### Adding the Registration Portal to Your Site

Use the shortcode `[parish_portal]` to add the registration interface to any page or post. For example:

```
[parish_portal]
```

This will create a user-friendly interface where parishioners can:
1. Register their household
2. Add family members
3. Record sacramental information
4. Update their information

### For Developers

#### Available REST Endpoints

1. **Authentication**

   ```
   POST /api/household/register
   ```
   Creates a new household account.
   ```json
   {
     "household_name": "Smith Family",
     "primary_email": "smith@example.com",
     "primary_phone": "613-555-0123",
     "password": "secure_password"
   }
   ```
   Returns: Household data and authentication token

   ```
   POST /api/household/login
   ```
   Authenticates an existing household.
   ```json
   {
     "email": "smith@example.com",
     "password": "secure_password"
   }
   ```
   Returns: Household data and authentication token

   ```
   POST /api/household/logout
   ```
   Invalidates the current authentication token.
   Requires: Authentication header with valid token

2. **Household Management**

   ```
   GET /api/household
   ```
   Retrieves household details for the authenticated household.
   Requires: Authentication header with valid token

   ```
   PUT /api/household
   ```
   Updates household information for the authenticated household.
   ```json
   {
     "name": "Smith Family",
     "address": "123 Main St",
     "city": "Springfield",
     "province": "ON",
     "postal_code": "K1A 0B1",
     "phone": "613-555-0123",
     "email": "smith@example.com"
   }
   ```
   Requires: Authentication header with valid token

   ```
   DELETE /api/household
   ```
   Deletes the authenticated household and all associated members.
   Requires: Authentication header with valid token

   ```
   GET /api/household/members
   ```
   Retrieves all members for the authenticated household.
   Requires: Authentication header with valid token

3. **Member Management**

   ```
   POST /api/household/members
   ```
   Adds a new member to the authenticated household.
   ```json
   {
     "first_name": "John",
     "last_name": "Smith",
     "email": "john@example.com",
     "phone": "613-555-0124",
     "baptised": true,
     "baptism_date": "1990-01-01",
     "baptism_parish": "St. Mary's",
     "first_communion": false,
     "confirmed": false
   }
   ```
   Requires: Authentication header with valid token

   ```
   GET /api/members/{id}
   ```
   Retrieves specific member information.
   Requires: Authentication header with valid token (member must belong to authenticated household)

   ```
   PUT /api/members/{id}
   ```
   Updates member information.
   Accepts the same fields as member creation.
   Requires: Authentication header with valid token (member must belong to authenticated household)

   ```
   DELETE /api/members/{id}
   ```
   Removes a member from the household.
   Requires: Authentication header with valid token (member must belong to authenticated household)

#### Authentication

The plugin handles authentication automatically using household-based authentication:
- Site-level token for creating new households (stored in WordPress options)
- Household-specific tokens for managing household data (stored in secure PHP sessions)
- Only households can authenticate - members cannot login independently
- Session-based authentication with secure cookie settings
- Automatic token cleanup on session expiration or logout
- HTTP-only cookies with Secure and SameSite flags enabled

#### Example: Making API Requests

```php
// Example of making an authenticated API request
$api_url = get_option('matthew_connector_api_url');
$token = $_SESSION['matthew_household_token'] ?? null;

$response = wp_remote_post($api_url . '/api/household/members', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json'
    ],
    'body' => json_encode([
        'first_name' => 'John',
        'last_name' => 'Smith',
        'email' => 'john@example.com'
    ]),
    'timeout' => 15,
    'sslverify' => true
]);
```

## Security

- All API requests are authenticated using Laravel Sanctum tokens
- Household tokens are stored only in secure PHP sessions, never in the database
- Session cookies are HTTP-only, Secure, and use SameSite=Strict
- Sessions expire automatically after inactivity
- Households can only access their own data
- Passwords are securely hashed
- WordPress nonces are used for admin actions
- Input validation on both WordPress and Laravel sides
- Automatic token cleanup on authentication failures
- No sensitive data stored in WordPress database

## Troubleshooting

1. **API Connection Issues**
   - Verify HTTPS is properly configured
   - Check firewall settings
   - Ensure correct API URL configuration

2. **Cannot connect to API**
   - Verify API URL in settings
   - Check site token is valid
   - Ensure Laravel backend is accessible

3. **Authentication errors**
   - Regenerate site token
   - Clear WordPress transients
   - Check Laravel Sanctum configuration

## Support

For support, please:
1. Check the troubleshooting section
2. Review Laravel logs for API errors
3. Contact your parish administrator

## License

This plugin is licensed under the GPL v2 or later.

## Changelog

### 1.0.0
- Initial release
- Household registration
- Member management
- REST API integration
- Session-based authentication
