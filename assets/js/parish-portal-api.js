/**
 * Parish Portal API Client
 * Handles all communication with the Matthew API
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    // API configuration cache
    let matthewApiConfig = null;

    /**
     * Get Matthew API configuration from WordPress
     */
    async function getMatthewApiConfig() {
        if (matthewApiConfig) {
            return matthewApiConfig;
        }

        try {
            const response = await $.ajax({
                url: parishPortalAjax.ajaxurl,
                method: 'GET',
                data: {
                    action: 'get_matthew_api_config',
                    nonce: parishPortalAjax.nonce
                }
            });

            if (response.success) {
                matthewApiConfig = response.data;
                console.log('Matthew API config loaded:', matthewApiConfig);
                return matthewApiConfig;
            } else {
                throw new Error(response.data || 'Failed to load API configuration');
            }
        } catch (error) {
            console.error('Failed to get Matthew API config:', error);
            throw error;
        }
    }

    /**
     * Make authenticated API request
     */
    async function makeApiRequest(endpoint, options = {}) {
        const apiConfig = await getMatthewApiConfig();
        const token = localStorage.getItem('matthew_household_token');
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            defaultOptions.headers['Authorization'] = 'Bearer ' + token;
        }

        const requestOptions = {
            url: apiConfig.apiUrl + endpoint,
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        if (requestOptions.data && typeof requestOptions.data === 'object' && requestOptions.method !== 'GET') {
            requestOptions.data = JSON.stringify(requestOptions.data);
        }

        try {
            const response = await $.ajax(requestOptions);
            return response;
        } catch (error) {
            // Handle 401 errors by clearing token and redirecting to auth
            if (error.status === 401) {
                localStorage.removeItem('matthew_household_token');
                if (window.ParishPortal.Auth) {
                    window.ParishPortal.Auth.showAuthForms();
                }
            }
            throw error;
        }
    }

    /**
     * Register new household
     */
    async function register(userData) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.register, {
            method: 'POST',
            data: userData
        });
    }

    /**
     * Login household
     */
    async function login(credentials) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.login, {
            method: 'POST',
            data: credentials
        });
    }

    /**
     * Logout household
     */
    async function logout() {
        const apiConfig = await getMatthewApiConfig();
        try {
            await makeApiRequest(apiConfig.endpoints.logout, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
        }
        localStorage.removeItem('matthew_household_token');
    }

    /**
     * Get household data
     */
    async function getHousehold() {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.household);
    }

    /**
     * Update household data
     */
    async function updateHousehold(householdData) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.household, {
            method: 'PUT',
            data: householdData
        });
    }

    /**
     * Get household members
     */
    async function getMembers() {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.members);
    }

    /**
     * Add new member
     */
    async function addMember(memberData) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.members, {
            method: 'POST',
            data: memberData
        });
    }

    /**
     * Update member
     */
    async function updateMember(memberId, memberData) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest(apiConfig.endpoints.member + '/' + memberId, {
            method: 'PUT',
            data: memberData
        });
    }

    /**
     * Delete member
     */
    async function deleteMember(memberId) {
        const apiConfig = await getMatthewApiConfig();
        return makeApiRequest('/api/members/' + memberId, {
            method: 'DELETE'
        });
    }

    /**
     * Check if user has valid token
     */
    function hasValidToken() {
        return !!localStorage.getItem('matthew_household_token');
    }

    /**
     * Get stored token
     */
    function getToken() {
        return localStorage.getItem('matthew_household_token');
    }

    /**
     * Store token
     */
    function setToken(token) {
        localStorage.setItem('matthew_household_token', token);
    }

    /**
     * Clear token
     */
    function clearToken() {
        localStorage.removeItem('matthew_household_token');
    }

    // Export functions to global namespace
    window.ParishPortal.API = {
        getMatthewApiConfig,
        makeApiRequest,
        register,
        login,
        logout,
        getHousehold,
        updateHousehold,
        getMembers,
        addMember,
        updateMember,
        deleteMember,
        hasValidToken,
        getToken,
        setToken,
        clearToken
    };

})(jQuery);
