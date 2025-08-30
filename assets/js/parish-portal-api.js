/**
 * Parish Portal API Client
 * Handles all communication with the Matthew API
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    /**
     * Upload certificate for a member
     */
    async function uploadCertificate(memberId, certificateType, file) {
        const apiConfig = await getMatthewApiConfig();
        const token = getToken();
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const formData = new FormData();
        formData.append('certificate_type', certificateType);
        formData.append('file', file);

        try {
            const response = await fetch(`${apiConfig.apiUrl}/api/members/${memberId}/certificates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Upload failed with status ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Certificate upload error:', error);
            throw error;
        }
    }

    /**
     * Get certificates for a member
     */
    async function getCertificates(memberId) {
        const apiConfig = await getMatthewApiConfig();
        const token = getToken();
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        try {
            const response = await fetch(`${apiConfig.apiUrl}/api/members/${memberId}/certificates`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to load certificates with status ${response.status}`);
            }

            const certificates = await response.json();
            return certificates;

        } catch (error) {
            console.error('Error loading certificates:', error);
            throw error;
        }
    }

    /**
     * Delete a certificate for a member
     */
    async function deleteCertificate(memberId, certificateType) {
        const apiConfig = await getMatthewApiConfig();
        const token = getToken();
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        try {
            const response = await fetch(`${apiConfig.apiUrl}/api/members/${memberId}/certificates/${certificateType}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete certificate with status ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Certificate delete error:', error);
            throw error;
        }
    }

    /**
     * Download certificate file with proper authentication
     */
    async function downloadCertificate(memberId, certificateType) {
        const apiConfig = await getMatthewApiConfig();
        const token = getToken();
        
        if (!token) {
            throw new Error('Authentication token not found');
        }

        try {
            const response = await fetch(`${apiConfig.apiUrl}/api/members/${memberId}/certificates/${certificateType}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/octet-stream',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
                throw new Error(errorData.message || `Download failed with status ${response.status}`);
            }

            // Get the filename from the Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'certificate';
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Create a blob from the response
            const blob = await response.blob();
            
            // Create a temporary URL and download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, filename };

        } catch (error) {
            console.error('Certificate download error:', error);
            throw error;
        }
    }

    // Export API functions
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
        uploadCertificate,
        getCertificates,
        deleteCertificate,
        downloadCertificate,
        hasValidToken,
        getToken,
        setToken,
        clearToken
    };

    // Simple configuration cache
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
                method: 'POST',
                data: {
                    action: 'matthew_get_api_config',
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

})(jQuery);
