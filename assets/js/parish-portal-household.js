/**
 * Parish Portal Household Management
 * Handles household data and form management
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    // Current household data cache
    let currentHouseholdData = null;

    /**
     * Get current household data
     */
    function getCurrentHouseholdData() {
        return currentHouseholdData;
    }

    /**
     * Set current household data
     */
    function setCurrentHouseholdData(data) {
        currentHouseholdData = data;
    }

    /**
     * Clear household data
     */
    function clearHouseholdData() {
        currentHouseholdData = null;
        
        // Clear forms
        $('#household-form')[0].reset();
        $('#member-list').empty();
    }

    /**
     * Load household data from API
     */
    async function loadHouseholdData() {
        if (!window.ParishPortal.API.hasValidToken()) {
            console.log('No token available for loading household data');
            if (window.ParishPortal.Auth) {
                window.ParishPortal.Auth.showAuthForms();
            }
            return;
        }

        try {
            console.log('Loading household data...');
            
            const response = await window.ParishPortal.API.getHousehold();
            console.log('Household response:', response);

            if (response.success && response.data) {
                currentHouseholdData = response.data;
                populateHouseholdForm(response.data);
                
                // Load members if the module is available
                if (window.ParishPortal.Members) {
                    await window.ParishPortal.Members.loadHouseholdMembers();
                }
            } else {
                throw new Error(response.message || 'Failed to load household data');
            }
        } catch (error) {
            console.error('Error loading household data:', error);
            
            if (error.status === 401) {
                console.log('Token expired, clearing and showing auth forms');
                window.ParishPortal.API.clearToken();
                if (window.ParishPortal.Auth) {
                    window.ParishPortal.Auth.showAuthForms();
                }
            } else {
                window.ParishPortal.Utils.displayError($('#household-message'), error.responseJSON || error);
            }
        }
    }

    /**
     * Populate household form with data
     */
    function populateHouseholdForm(data) {
        console.log('Populating household form with:', data);
        
        $('#household_name').val(data.name || '');
        $('#household_email').val(data.email || '');
        $('#household_phone').val(data.phone || '');
        $('#household_address').val(data.address || '');
        
        // Handle relationship status if field exists
        if ($('#household_relationship_status').length) {
            $('#household_relationship_status').val(data.relationship_status || '');
        }
        
        // Handle marriage details if fields exist
        if ($('#household_marriage_date').length && data.marriage_date) {
            $('#household_marriage_date').val(data.marriage_date);
        }
        
        if ($('#household_marriage_parish').length && data.marriage_parish) {
            $('#household_marriage_parish').val(data.marriage_parish);
        }
    }

    /**
     * Initialize household form submission
     */
    function initHouseholdForm() {
        $('#household-form').off('submit').on('submit', async function(e) {
            e.preventDefault();
            
            if (!window.ParishPortal.API.hasValidToken()) {
                window.ParishPortal.Utils.displayError($('#household-message'), { message: 'Please log in first' });
                return;
            }
            
            const $form = $(this);
            const $submitButton = $form.find('input[type="submit"]');
            const $message = $('#household-message');
            
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Updating...');
            window.ParishPortal.Utils.clearMessage($message);
            
            const formData = {
                name: $('#household_name').val(),
                email: $('#household_email').val(),
                phone: $('#household_phone').val(),
                address: $('#household_address').val()
            };
            
            // Add optional fields if they exist
            if ($('#household_relationship_status').length) {
                formData.relationship_status = $('#household_relationship_status').val();
            }
            if ($('#household_marriage_date').length) {
                formData.marriage_date = $('#household_marriage_date').val();
            }
            if ($('#household_marriage_parish').length) {
                formData.marriage_parish = $('#household_marriage_parish').val();
            }
            
            console.log('Updating household with:', formData);
            
            try {
                const response = await window.ParishPortal.API.updateHousehold(formData);
                
                console.log('Household update response:', response);
                
                if (response.success) {
                    currentHouseholdData = response.data;
                    window.ParishPortal.Utils.displaySuccess($message, 'Household information updated successfully!');
                } else {
                    throw new Error(response.message || 'Failed to update household information');
                }
            } catch (error) {
                console.error('Household update error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });
    }

    /**
     * Initialize tab switching functionality
     */
    function initTabSwitching() {
        $('.tab-button').off('click').on('click', function() {
            const tabId = $(this).data('tab');
            
            // Update tab buttons
            $('.tab-button').removeClass('active');
            $(this).addClass('active');
            
            // Update tab content
            $('.tab-content').removeClass('active');
            $('#' + tabId).addClass('active');
        });
    }

    /**
     * Initialize all household functionality
     */
    function init() {
        initHouseholdForm();
        initTabSwitching();
    }

    // Export functions to global namespace
    window.ParishPortal.Household = {
        init,
        getCurrentHouseholdData,
        setCurrentHouseholdData,
        clearHouseholdData,
        loadHouseholdData,
        populateHouseholdForm,
        initHouseholdForm,
        initTabSwitching
    };

})(jQuery);
