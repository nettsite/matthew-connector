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
        
        // Clear forms safely
        const householdForm = $('#household-info-form');
        if (householdForm.length > 0) {
            householdForm[0].reset();
        }
        
        const memberList = $('#members-list');
        if (memberList.length > 0) {
            memberList.empty();
        }
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

            // Handle both WordPress-style response format and direct API response format
            let householdData = null;
            if (response.success && response.data) {
                // WordPress-style response format
                householdData = response.data;
            } else if (response.household) {
                // Direct API response format
                householdData = response.household;
            } else if (response.success === undefined && response.id) {
                // Direct household object
                householdData = response;
            }

            if (householdData) {
                currentHouseholdData = householdData;
                populateHouseholdForm(householdData);
                
                // Load members like in the backup - either from household data or fetch separately
                if (householdData.members && householdData.members.length > 0) {
                    // Members included in household response
                    console.log('Members included in household response:', householdData.members);
                    currentHouseholdData.members = householdData.members;
                    if (window.ParishPortal.Members) {
                        window.ParishPortal.Members.displayMembersList(householdData.members);
                    }
                } else {
                    // Load members if the module is available
                    if (window.ParishPortal.Members) {
                        await window.ParishPortal.Members.loadHouseholdMembers();
                    }
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
        
        // Handle different possible data structures like the backup did
        const householdData = data.household || data;
        
        $('#household_name_edit').val(householdData.name || householdData.household_name || '');
        $('#household_address').val(householdData.address || '');
        $('#household_city').val(householdData.city || '');
        $('#household_province').val(householdData.province || '');
        $('#household_postal_code').val(householdData.postal_code || '');
        $('#household_phone_edit').val(householdData.phone || householdData.primary_phone || '');
        $('#household_email_edit').val(householdData.email || householdData.primary_email || '');
        
        // Set terms acceptance checkbox - checked if terms_accepted has a value (timestamp), unchecked if null/empty
        $('#household_terms_accepted').prop('checked', !!householdData.terms_accepted);
        
        // Update the household title
        $('#household-title').text(householdData.name || householdData.household_name || 'Your Household');
    }

    /**
     * Initialize household form submission
     */
    function initHouseholdForm() {
        $('#household-info-form').off('submit').on('submit', async function(e) {
            e.preventDefault();
            
            if (!window.ParishPortal.API.hasValidToken()) {
                window.ParishPortal.Utils.displayError($('#household-message'), { message: 'Please log in first' });
                return;
            }
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"], input[type="submit"]');
            const $message = $('#household-info-message');
            
            // Validate terms acceptance
            const termsAccepted = $('#household_terms_accepted').prop('checked');
            if (!termsAccepted) {
                window.ParishPortal.Utils.displayError($message, 'You must agree to the Terms & Conditions and Privacy Policy');
                return;
            }
            
            window.ParishPortal.Utils.setButtonLoading($submitButton, 'Updating...');
            window.ParishPortal.Utils.clearMessage($message);
            
            const formData = {
                name: $('#household_name_edit').val(),
                address: $('#household_address').val(),
                city: $('#household_city').val(),
                province: $('#household_province').val(),
                postal_code: $('#household_postal_code').val(),
                phone: $('#household_phone_edit').val(),
                email: $('#household_email_edit').val(),
                terms_accepted: 1
            };
            
            console.log('Updating household with:', formData);
            
            try {
                const response = await window.ParishPortal.API.updateHousehold(formData);
                
                console.log('Household update response:', response);
                
                if (response.household) {
                    // Preserve existing members when updating household data
                    const existingMembers = currentHouseholdData ? currentHouseholdData.members : null;
                    currentHouseholdData = response.household;
                    if (existingMembers) {
                        currentHouseholdData.members = existingMembers;
                    }
                    
                    window.ParishPortal.Utils.displaySuccess($message, 'Household information updated successfully!');
                    
                    // Update the title
                    $('#household-title').text($('#household_name_edit').val());
                } else {
                    throw new Error('Failed to update household information');
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
            console.log('Tab button clicked, target tab:', tabId);
            
            // Update tab buttons
            $('.tab-button').removeClass('active');
            $(this).addClass('active');
            
            // Update tab content - use the correct tab content selector
            $('.tab-content').removeClass('active');
            $('#' + tabId + '-tab').addClass('active');
            
            console.log('Tab switched to:', tabId);
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
