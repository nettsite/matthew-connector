# AI Coding Instructions for Matthew Connector Plugin

## Project Overview
Matthew Connector is a WordPress plugin that integrates with a Laravel-based parish management system. It enables parish registration and household management through WordPress, using GraphQL for data exchange and Laravel Sanctum for authentication.

## Architecture
- **Plugin Core** (`matthew-connector.php`): Entry point with constants and activation hooks
- **Main Class** (`includes/class-matthew-connector.php`): Singleton pattern implementation managing plugin lifecycle
- **API Integration** (`includes/rest/`): Laravel API client and authentication handling
- **GraphQL Layer** (`includes/graphql/`): WPGraphQL type definitions and mutations
- **Frontend** (`assets/js/`): React-based components for registration portal

## Key Patterns and Conventions

### PHP Coding Standards
- Use PHP 8.2+ features and typing
- Follow WordPress coding standards with custom bracket style:
```php
if (condition)
{
    doSomething();
}
```
- Use underscore naming for fields (e.g., `api_url`, `site_token`)

### Plugin Architecture Patterns
1. **Singleton Usage**: Core plugin class uses singleton pattern
```php
public static function instance() {
    if (null === self::$instance) {
        self::$instance = new self();
    }
    return self::$instance;
}
```

2. **Dependency Loading**: Modular approach using `load_dependencies()`
3. **WordPress Integration**: Uses standard action hooks for initialization

### Security Practices
- Always verify nonces for admin actions
- Use `ABSPATH` check in PHP files
- Sanitize API responses before use
- Store sensitive data (tokens) in WordPress options

## Development Workflow

### Local Development Setup
1. Configure `matthew_connector_api_url` in WordPress options
2. Set up a development token using Laravel Tinker
3. Enable WP_DEBUG in wp-config.php

### Testing
- Manual testing through WordPress admin interface
- API integration testing using the registration portal
- GraphQL testing through WPGraphQL IDE

## Integration Points
1. **Laravel Backend**:
   - Requires valid Sanctum token
   - GraphQL endpoint at `{api_url}/graphql`
   - Member authentication endpoints

2. **WordPress**:
   - WPGraphQL plugin dependency
   - Shortcode `[parish_portal]` for frontend integration
   - Admin menu under "Matthew Settings"

## Common Tasks
1. **Adding GraphQL Types**:
   - Add type definition in `includes/graphql/types.php`
   - Register in `Matthew_GraphQL_Types::register()`

2. **Adding New Features**:
   - Create new class in appropriate directory
   - Load in `load_dependencies()`
   - Hook into WordPress actions/filters as needed

## Troubleshooting
- Check WordPress debug log for PHP errors
- Verify API connection in Matthew Settings
- Ensure WPGraphQL plugin is active
- Validate Sanctum token permissions
