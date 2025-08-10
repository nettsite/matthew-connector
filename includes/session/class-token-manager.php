<?php

namespace MatthewConnector\Session;

class TokenManager {
    private const SESSION_KEY = 'matthew_household_token';

    public static function init() {
        if (!session_id()) {
            session_start([
                'cookie_httponly' => true,
                'cookie_secure' => is_ssl(),
                'cookie_samesite' => 'Strict'
            ]);
        }
    }

    public static function setToken(string $token): void {
        $_SESSION[self::SESSION_KEY] = $token;
    }

    public static function getToken(): ?string {
        return $_SESSION[self::SESSION_KEY] ?? null;
    }

    public static function clearToken(): void {
        unset($_SESSION[self::SESSION_KEY]);
    }
}
