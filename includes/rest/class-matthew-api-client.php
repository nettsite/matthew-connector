<?php

class Matthew_API_Client {
    private $api_url;
    private $site_token;

    public function __construct() {
        $this->api_url = get_option('matthew_connector_api_url');
        $this->site_token = get_option('matthew_connector_site_token');
    }

    public function get($endpoint, $token = null) {
        return $this->request('GET', $endpoint, null, $token);
    }

    public function post($endpoint, $data, $token = null) {
        return $this->request('POST', $endpoint, $data, $token);
    }

    public function put($endpoint, $data, $token = null) {
        return $this->request('PUT', $endpoint, $data, $token);
    }

    public function delete($endpoint, $token = null) {
        return $this->request('DELETE', $endpoint, null, $token);
    }

    private function log_debug($message, $context = []) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                '[Matthew API] %s: %s',
                $message,
                json_encode($context, JSON_PRETTY_PRINT)
            ));
        }
    }

    private function request($method, $endpoint, $data = null, $token = null) {
        $url = rtrim($this->api_url, '/') . '/' . ltrim($endpoint, '/');
        
        $args = [
            'method' => $method,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . ($token ?? $this->site_token),
            ],
            'timeout' => 30, // Increase timeout for slow connections
            'sslverify' => true
        ];

        if ($data !== null) {
            $args['body'] = wp_json_encode($data);
        }

        // Log request details
        $this->log_debug('API Request', [
            'url' => $url,
            'method' => $method,
            'headers' => array_diff_key($args['headers'], ['Authorization' => true]), // Don't log token
            'data' => $data ? array_diff_key($data, ['password' => true]) : null // Don't log passwords
        ]);

        $response = wp_remote_request($url, $args);

        // Log raw response for debugging
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->log_debug('API Error', [
                'error' => $error_message,
                'code' => $response->get_error_code(),
                'data' => $response->get_error_data()
            ]);
            throw new Exception($error_message);
        }

        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        $headers = wp_remote_retrieve_headers($response);

        // Log response details
        $this->log_debug('API Response', [
            'status' => $status,
            'headers' => $headers,
            'body' => $body ? json_decode($body, true) : null,
            'raw_body' => $body
        ]);

        if ($status >= 400) {
            $error_data = json_decode($body, true);
            $error_message = isset($error_data['message']) 
                ? $error_data['message'] 
                : sprintf('API request failed with status %d: %s', $status, $body);
            
            $this->log_debug('API Error Response', [
                'status' => $status,
                'message' => $error_message,
                'data' => $error_data
            ]);
            
            throw new Exception($error_message, $status);
        }

        $decoded = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->log_debug('JSON Decode Error', [
                'error' => json_last_error_msg(),
                'raw_body' => $body
            ]);
            throw new Exception('Invalid JSON response from API: ' . json_last_error_msg());
        }

        return $decoded;
    }
}
