/**
 * Parish Portal Member Management
 * Handles member CRUD operations and display
 */

(function($) {
    'use strict';

    // Create global namespace if it doesn't exist
    window.ParishPortal = window.ParishPortal || {};

    // Member editing state
    let isEditingMember = false;
    let currentEditingMemberId = null;

    /**
     * Load household members from API
     */
    async function loadHouseholdMembers() {
        if (!window.ParishPortal.API.hasValidToken()) {
            console.log('No token available for loading members');
            return;
        }

        try {
            console.log('Loading household members...');
            
            const response = await window.ParishPortal.API.getMembers();
            console.log('Members response:', response);

            // Handle both WordPress-style response format and direct API response format
            let membersData = null;
            if (response.success && response.data) {
                // WordPress-style response format
                membersData = response.data;
            } else if (response.members) {
                // Direct API response format with members property
                membersData = response.members;
            } else if (Array.isArray(response)) {
                // Direct array of members
                membersData = response;
            }

            if (membersData) {
                console.log('Loading members from API response:', membersData);
                
                // Update the current household data with fresh member data like in backup
                const householdData = window.ParishPortal.Household.getCurrentHouseholdData();
                if (householdData) {
                    console.log('Before update - householdData.members:', householdData.members);
                    householdData.members = membersData;
                    console.log('After update - householdData.members:', householdData.members);
                    console.log('Updated householdData.members with fresh data');
                    window.ParishPortal.Household.setCurrentHouseholdData(householdData);
                } else {
                    console.log('No household data to update');
                }
                
                displayMembersList(membersData);
            } else {
                throw new Error(response.message || 'Failed to load members data');
            }
        } catch (error) {
            console.error('Error loading members:', error);
            window.ParishPortal.Utils.displayError($('#members-message'), error.responseJSON || error);
        }
    }

    /**
     * Display members list
     */
    function displayMembersList(members) {
        console.log('Displaying members list:', members);
        console.log('Members type:', typeof members);
        console.log('Members length:', members ? members.length : 'null/undefined');
        
        const $membersList = $('#members-list');
        $membersList.empty();
        
        if (!members || members.length === 0) {
            console.log('No members to display, showing empty message');
            $membersList.html('<p>No members added yet. Click "Add Member" to get started.</p>');
            return;
        }
        
        console.log('Rendering', members.length, 'members');
        members.forEach((member, index) => {
            console.log('Rendering member', index, ':', member);
            const sacraments = [];
            if (member.baptised) sacraments.push('Baptised');
            if (member.first_communion) sacraments.push('First Communion');
            if (member.confirmed) sacraments.push('Confirmed');

            const memberCard = $(`
                <div class="member-card" data-member-id="${member.id}">
                    <div class="member-info">
                        <h4>${member.first_name} ${member.last_name}</h4>
                        <p>
                            ${member.email ? 'Email: ' + member.email : ''}
                            ${member.phone ? (member.email ? ' | ' : '') + 'Phone: ' + member.phone : ''}
                        </p>
                        ${sacraments.length > 0 ? '<p>Sacraments: ' + sacraments.join(', ') + '</p>' : ''}
                    </div>
                    <div class="member-actions">
                        <button type="button" class="button edit-member-btn" data-member-id="${member.id}">Edit</button>
                        <button type="button" class="button button-secondary delete-member-btn" data-member-id="${member.id}">Delete</button>
                    </div>
                </div>
            `);
            
            $membersList.append(memberCard);
        });
        console.log('Finished rendering members, final HTML:', $membersList.html());
    }

    /**
     * Show member form for adding/editing
     */
    function showMemberForm(member = null) {
        console.log('showMemberForm called with:', member);
        
        const $modal = $('#member-form-modal');
        console.log('Member form modal found:', $modal.length);
        
        // Show modal
        $modal.show();
        
        console.log('Modal shown, visible:', $modal.is(':visible'));
        
        if (member) {
            $('#member-form-title').text('Edit Member');
            $('#member_id').val(member.id);
            $('#member_first_name').val(member.first_name);
            $('#member_last_name').val(member.last_name);
            $('#member_email').val(member.email || '');
            $('#member_phone').val(member.phone || '');
            $('#member_occupation').val(member.occupation || '');
            $('#member_skills').val(member.skills || '');
            $('#member_baptised').prop('checked', member.baptised || false);
            
            // Format dates for HTML date inputs (yyyy-MM-dd)
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };
            
            $('#baptism_date').val(formatDate(member.baptism_date));
            $('#baptism_parish').val(member.baptism_parish || '');
            if (member.baptised) {
                $('#baptism-details').show();
            } else {
                $('#baptism-details').hide();
            }
            $('#member_first_communion').prop('checked', member.first_communion || false);
            $('#first_communion_date').val(formatDate(member.first_communion_date));
            $('#first_communion_parish').val(member.first_communion_parish || '');
            if (member.first_communion) {
                $('#first-communion-details').show();
            } else {
                $('#first-communion-details').hide();
            }
            $('#member_confirmed').prop('checked', member.confirmed || false);
            $('#confirmation_date').val(formatDate(member.confirmation_date));
            $('#confirmation_parish').val(member.confirmation_parish || '');
            if (member.confirmed) {
                $('#confirmation-details').show();
            } else {
                $('#confirmation-details').hide();
            }
            
            isEditingMember = true;
            currentEditingMemberId = member.id;
            
            // Load certificates after modal is shown and form is populated
            setTimeout(() => {
                loadMemberCertificates(member.id);
            }, 100);
        } else {
            $('#member-form-title').text('Add New Member');
            resetMemberForm();
        }
    }

    /**
     * Hide member form
     */
    function hideMemberForm() {
        $('#member-form-modal').hide();
        $('#member-form')[0].reset();
        $('#member_id').val('');
        $('#member_occupation').val('');
        $('#member_skills').val('');
        $('#baptism-details').hide();
        $('#first-communion-details').hide();
        $('#confirmation-details').hide();
        $('#member-form-message').html('').removeClass('error success');
        
        // Clear certificate displays
        ['baptism', 'first_communion', 'confirmation'].forEach(certType => {
            $(`#${certType}_certificate_current`).hide();
            $(`#${certType}_certificate_filename`).text('');
        });
    }

    /**
     * Reset member form to add mode
     */
    function resetMemberForm() {
        isEditingMember = false;
        currentEditingMemberId = null;
        $('#member-form')[0].reset();
        $('#member-form input[type="submit"]').val('Add Member');
        $('#member-form h3').text('Add Family Member');
        window.ParishPortal.Utils.clearMessage($('#members-message'));
        
        // Hide all conditional detail sections
        $('#baptism-details').hide();
        $('#first-communion-details').hide();
        $('#confirmation-details').hide();
        
        // Clear certificate displays
        ['baptism', 'first_communion', 'confirmation'].forEach(certType => {
            $(`#${certType}_certificate_current`).hide();
            $(`#${certType}_certificate_filename`).text('');
        });
    }

    /**
     * Populate member form for editing
     */
    function populateMemberFormForEdit(member) {
        isEditingMember = true;
        currentEditingMemberId = member.id;
        
        $('#member_first_name').val(member.first_name || '');
        $('#member_last_name').val(member.last_name || '');
        $('#member_email').val(member.email || '');
        $('#member_phone').val(member.phone || '');
        $('#member_occupation').val(member.occupation || '');
        $('#member_skills').val(member.skills || '');
        
        $('#member_baptised').prop('checked', member.baptised || false);
        $('#baptism_date').val(member.baptism_date || '');
        $('#baptism_parish').val(member.baptism_parish || '');
        // Show baptism details if baptised
        if (member.baptised) {
            $('#baptism-details').show();
        }
        
        $('#member_first_communion').prop('checked', member.first_communion || false);
        $('#first_communion_date').val(member.first_communion_date || '');
        $('#first_communion_parish').val(member.first_communion_parish || '');
        // Show first communion details if received first communion
        if (member.first_communion) {
            $('#first-communion-details').show();
        }
        
        $('#member_confirmed').prop('checked', member.confirmed || false);
        $('#confirmation_date').val(member.confirmation_date || '');
        $('#confirmation_parish').val(member.confirmation_parish || '');
        // Show confirmation details if confirmed
        if (member.confirmed) {
            $('#confirmation-details').show();
        }
        
        $('#member-form input[type="submit"]').val('Update Member');
        $('#member-form h3').text('Edit Family Member');
        
        showMemberForm();
        $('#member-form')[0].scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Handle certificate file uploads for a member
     */
    async function handleCertificateUploads(memberId) {
        const certificateTypes = ['baptism', 'first_communion', 'confirmation'];
        const uploadPromises = [];

        for (const certType of certificateTypes) {
            const fileInput = document.getElementById(`${certType}_certificate`);
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                console.log(`Uploading ${certType} certificate:`, file.name);
                
                uploadPromises.push(
                    window.ParishPortal.API.uploadCertificate(memberId, certType, file)
                        .then(result => {
                            console.log(`${certType} certificate uploaded successfully:`, result);
                            return { type: certType, success: true, result };
                        })
                        .catch(error => {
                            console.error(`Error uploading ${certType} certificate:`, error);
                            return { type: certType, success: false, error: error.message };
                        })
                );
            }
        }

        if (uploadPromises.length > 0) {
            console.log(`Uploading ${uploadPromises.length} certificate(s)...`);
            const results = await Promise.all(uploadPromises);
            
            // Log results and show any errors
            const failedUploads = results.filter(r => !r.success);
            if (failedUploads.length > 0) {
                console.warn('Some certificate uploads failed:', failedUploads);
                // Could show specific error message to user here if needed
            } else {
                console.log('All certificate uploads completed successfully');
            }
        }
    }

    /**
     * Load and display existing certificates for a member
     */
    async function loadMemberCertificates(memberId) {
        console.log('loadMemberCertificates called with memberId:', memberId);
        
        // First check if certificate data is already available in the member object
        const householdData = window.ParishPortal.Household.getCurrentHouseholdData();
        console.log('householdData:', householdData);
        
        if (householdData && householdData.members) {
            const member = householdData.members.find(m => m.id == memberId);
            console.log('Found member:', member);
            
            if (member && member.certificates) {
                console.log('Using certificate data from member object:', member.certificates);
                displayCertificatesFromMemberData(member.certificates);
                return;
            } else {
                console.log('No certificates property found in member object');
            }
        } else {
            console.log('No household data or members found');
        }
        
        // Fallback: load certificates via API if not available in member data
        console.log('Falling back to API call for certificates');
        try {
            const certificates = await window.ParishPortal.API.getCertificates(memberId);
            console.log('Loaded certificates via API for member:', memberId, certificates);
            
            // Clear any existing certificate displays
            ['baptism', 'first_communion', 'confirmation'].forEach(certType => {
                const container = document.querySelector(`#${certType}_certificate_current`);
                if (container) {
                    container.innerHTML = '';
                }
            });
            
            // Display each certificate
            for (const [certType, certData] of Object.entries(certificates)) {
                if (certData && certData.url) {
                    displayExistingCertificate(certType, certData);
                }
            }
            
        } catch (error) {
            console.error('Error loading certificates:', error);
            // Don't show error to user as this is not critical
        }
    }

    /**
     * Display certificates from member data object
     */
    function displayCertificatesFromMemberData(certificates) {
        console.log('displayCertificatesFromMemberData called with:', certificates);
        
        // Clear any existing certificate displays
        ['baptism', 'first_communion', 'confirmation'].forEach(certType => {
            const container = document.querySelector(`#${certType}_certificate_current`);
            if (container) {
                container.innerHTML = '';
                console.log(`Cleared container for ${certType}`);
            } else {
                console.log(`Container not found for ${certType}`);
            }
        });
        
        // Display each certificate if it exists
        for (const [certType, certData] of Object.entries(certificates)) {
            console.log(`Processing certificate ${certType}:`, certData);
            if (certData && certData.url) {
                console.log(`Displaying certificate for ${certType}`);
                displayExistingCertificate(certType, certData);
            } else {
                console.log(`No valid certificate data for ${certType}`);
            }
        }
    }

    /**
     * Display an existing certificate with download/delete options
     */
    function displayExistingCertificate(certType, certData) {
        console.log(`displayExistingCertificate called for ${certType}:`, certData);
        
        const container = document.querySelector(`#${certType}_certificate_current`);
        if (!container) {
            console.error(`Container not found for certificate type: ${certType}`);
            return;
        }
        
        const fileName = certData.file_name || 'Certificate';
        const downloadUrl = certData.url;
        
        // Limit file name length for display
        const displayFileName = fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
        
        console.log(`Creating certificate display for ${certType} with file: ${fileName}`);
        
        const certificateHtml = `
            <div class="existing-certificate" style="margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; display: flex; align-items: center; width: 100%;">
                <span style="font-size: 13px; color: #555; flex-grow: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${fileName}">${displayFileName}</span>
                <div class="certificate-actions" style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 12px;">
                    <button type="button" class="button button-small download-certificate" data-cert-type="${certType}" style="padding: 4px 8px; font-size: 12px; line-height: 1.2;">Download</button>
                    <button type="button" class="button button-small button-secondary delete-certificate" data-cert-type="${certType}" style="padding: 4px 8px; font-size: 12px; line-height: 1.2;">Delete</button>
                </div>
            </div>
        `;
        
        container.innerHTML = certificateHtml;
        container.style.display = 'block';
        console.log(`Certificate display set for ${certType}:`, container.innerHTML);
        
        // Add secure download functionality
        const downloadBtn = container.querySelector('.download-certificate');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', async function() {
                try {
                    const token = window.ParishPortal.API.getToken();
                    if (!token) {
                        alert('Authentication token not found. Please log in again.');
                        return;
                    }
                    downloadBtn.disabled = true;
                    downloadBtn.textContent = 'Downloading...';
                    const response = await fetch(downloadUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Download failed.');
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }, 100);
                    downloadBtn.textContent = 'Download';
                    downloadBtn.disabled = false;
                } catch (err) {
                    alert('Failed to download file.');
                    downloadBtn.textContent = 'Download';
                    downloadBtn.disabled = false;
                }
            });
        }
        // Add delete functionality
        const deleteBtn = container.querySelector('.delete-certificate');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async function() {
                if (confirm('Are you sure you want to remove this certificate?')) {
                    await deleteMemberCertificate(currentEditingMemberId, certType);
                }
            });
            console.log(`Delete button event listener added for ${certType}`);
        }
    }

    /**
     * Delete a member certificate
     */
    async function deleteMemberCertificate(memberId, certType) {
        try {
            await window.ParishPortal.API.deleteCertificate(memberId, certType);
            console.log(`${certType} certificate deleted successfully`);
            
            // Clear the display
            const container = document.querySelector(`#${certType}_certificate_current`);
            if (container) {
                container.innerHTML = '';
            }
            
        } catch (error) {
            console.error(`Error deleting ${certType} certificate:`, error);
            alert('Failed to delete certificate. Please try again.');
        }
    }

    /**
     * Initialize member form submission
     */
    function initMemberForm() {
        $('#member-form').off('submit').on('submit', async function(e) {
            e.preventDefault();
            
            if (!window.ParishPortal.API.hasValidToken()) {
                window.ParishPortal.Utils.displayError($('#members-message'), { message: 'Please log in first' });
                return;
            }
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"], input[type="submit"]');
            const $message = $('#members-message');
            
            const loadingText = isEditingMember ? 'Updating...' : 'Adding...';
            window.ParishPortal.Utils.setButtonLoading($submitButton, loadingText);
            window.ParishPortal.Utils.clearMessage($message);
            
            try {
                const formData = {
                    first_name: $('#member_first_name').val(),
                    last_name: $('#member_last_name').val(),
                    email: $('#member_email').val(),
                    phone: $('#member_phone').val(),
                    occupation: $('#member_occupation').val(),
                    skills: $('#member_skills').val(),
                    baptised: $('#member_baptised').is(':checked'),
                    baptism_date: $('#baptism_date').val(),
                    baptism_parish: $('#baptism_parish').val(),
                    first_communion: $('#member_first_communion').is(':checked'),
                    first_communion_date: $('#first_communion_date').val(),
                    first_communion_parish: $('#first_communion_parish').val(),
                    confirmed: $('#member_confirmed').is(':checked'),
                    confirmation_date: $('#confirmation_date').val(),
                    confirmation_parish: $('#confirmation_parish').val()
                };
                
                let response;
                if (isEditingMember) {
                    console.log('Updating member:', currentEditingMemberId, formData);
                    response = await window.ParishPortal.API.updateMember(currentEditingMemberId, formData);
                } else {
                    console.log('Adding new member:', formData);
                    response = await window.ParishPortal.API.addMember(formData);
                }

                console.log('Member save response:', response);
                
                // Handle certificate uploads if member was saved successfully
                // Extract member ID from different possible response formats
                let memberId;
                if (response.data && response.data.id) {
                    memberId = response.data.id;
                } else if (response.member && response.member.id) {
                    memberId = response.member.id;
                } else if (response.id) {
                    memberId = response.id;
                } else {
                    console.error('Could not extract member ID from response:', response);
                    throw new Error('Failed to get member ID from save response');
                }
                
                console.log('Using member ID for certificate uploads:', memberId);
                await handleCertificateUploads(memberId);
                
                const successMessage = isEditingMember ? 'Member updated successfully!' : 'Member added successfully!';
                window.ParishPortal.Utils.displaySuccess($message, successMessage);
                
                // Reload members list
                console.log('About to reload household members...');
                await loadHouseholdMembers();
                console.log('Finished reloading household members');
                
                // Hide form after short delay
                setTimeout(() => {
                    hideMemberForm();
                }, 1500);
                
            } catch (error) {
                console.error('Member save error:', error);
                window.ParishPortal.Utils.displayError($message, error.responseJSON || error);
            } finally {
                window.ParishPortal.Utils.resetButton($submitButton);
            }
        });
    }

    /**
     * Initialize add member button
     */
    function initAddMemberButton() {
        $('#add-member-btn').off('click').on('click', function() {
            resetMemberForm();
            showMemberForm();
        });
    }

    /**
     * Initialize cancel member form button
     */
    function initCancelMemberForm() {
        $('#cancel-member-btn').off('click').on('click', function() {
            hideMemberForm();
        });
    }

    /**
     * Initialize edit member functionality
     */
    function initEditMember() {
        $(document).off('click', '.edit-member-btn').on('click', '.edit-member-btn', async function() {
            console.log('Edit button clicked!');
            const memberId = $(this).data('member-id');
            console.log('Member ID:', memberId);
            editMember(memberId);
        });
    }

    /**
     * Initialize delete member functionality
     */
    function initDeleteMember() {
        $(document).off('click', '.delete-member-btn').on('click', '.delete-member-btn', async function() {
            const $deleteButton = $(this);
            const memberId = $deleteButton.data('member-id');
            const memberName = $deleteButton.closest('.member-card').find('h4').text();
            
            if (!confirm(`Are you sure you want to delete ${memberName}?`)) {
                return;
            }
            
            // Show loading state immediately
            window.ParishPortal.Utils.setButtonLoading($deleteButton, 'Deleting...');
            
            try {
                console.log('Deleting member:', memberId);
                
                const response = await window.ParishPortal.API.deleteMember(memberId);
                
                console.log('Member delete response:', response);
                
                window.ParishPortal.Utils.displaySuccess($('#members-message'), 'Family member deleted successfully!');
                await loadHouseholdMembers(); // Refresh the members list
            } catch (error) {
                console.error('Member delete error:', error);
                window.ParishPortal.Utils.displayError($('#members-message'), error.responseJSON || error);
            } finally {
                // Reset button state (in case of error, since successful delete removes the button)
                window.ParishPortal.Utils.resetButton($deleteButton);
            }
        });
    }

    /**
     * Edit member function like in the backup
     */
    async function editMember(memberId) {
        console.log('editMember called with ID:', memberId);
        
        // Get current household data which should have members
        const householdData = window.ParishPortal.Household.getCurrentHouseholdData();
        console.log('currentHouseholdData:', householdData);
        console.log('currentHouseholdData.members:', householdData ? householdData.members : 'no household data');
        
        if (!householdData || !householdData.members) {
            console.log('No household data or members available');
            return;
        }
        
        const member = householdData.members.find(m => m.id == memberId);
        console.log('Found member for ID', memberId, ':', member);
        if (member) {
            showMemberForm(member);
        } else {
            console.log('Member not found in currentHouseholdData.members');
            // Let's try to fetch fresh data and try again
            console.log('Attempting to reload household data and try again...');
            await window.ParishPortal.Household.loadHouseholdData();
            const freshHouseholdData = window.ParishPortal.Household.getCurrentHouseholdData();
            if (freshHouseholdData && freshHouseholdData.members) {
                const freshMember = freshHouseholdData.members.find(m => m.id == memberId);
                if (freshMember) {
                    console.log('Found member after reload:', freshMember);
                    showMemberForm(freshMember);
                } else {
                    console.log('Still no member found after reload');
                }
            }
        }
    }

    /**
     * Initialize conditional form fields
     */
    function initConditionalFields() {
        // Show/hide baptism details
        $('#member_baptised').on('change', function() {
            const $baptismFields = $('#baptism-fields');
            if ($(this).is(':checked')) {
                $baptismFields.removeClass('hidden');
            } else {
                $baptismFields.addClass('hidden');
            }
        });

        // Show/hide first communion details
        $('#member_first_communion').on('change', function() {
            const $communionFields = $('#first-communion-fields');
            if ($(this).is(':checked')) {
                $communionFields.removeClass('hidden');
            } else {
                $communionFields.addClass('hidden');
            }
        });

        // Show/hide confirmation details
        $('#member_confirmed').on('change', function() {
            const $confirmationFields = $('#confirmation-fields');
            if ($(this).is(':checked')) {
                $confirmationFields.removeClass('hidden');
            } else {
                $confirmationFields.addClass('hidden');
            }
        });
    }

    /**
     * Initialize modal event handlers
     */
    function initModalHandlers() {
        // Close modal when clicking the X button
        $(document).on('click', '.matthew-modal-close', function() {
            hideMemberForm();
        });

        // Close modal when clicking outside of it
        $(document).on('click', '.matthew-modal', function(e) {
            if (e.target === this) {
                hideMemberForm();
            }
        });

        // Close modal with Escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#member-form-modal').is(':visible')) {
                hideMemberForm();
            }
        });
    }

    /**
     * Initialize conditional fields for sacramental information
     */
    function initConditionalFields() {
        // Toggle baptism details when baptised checkbox changes
        $(document).on('change', '#member_baptised', function() {
            if ($(this).is(':checked')) {
                $('#baptism-details').slideDown();
            } else {
                $('#baptism-details').slideUp();
                // Clear the fields when hiding
                $('#baptism_date').val('');
                $('#baptism_parish').val('');
            }
        });

        // Toggle first communion details when first communion checkbox changes
        $(document).on('change', '#member_first_communion', function() {
            if ($(this).is(':checked')) {
                $('#first-communion-details').slideDown();
            } else {
                $('#first-communion-details').slideUp();
                // Clear the fields when hiding
                $('#first_communion_date').val('');
                $('#first_communion_parish').val('');
            }
        });

        // Toggle confirmation details when confirmed checkbox changes
        $(document).on('change', '#member_confirmed', function() {
            if ($(this).is(':checked')) {
                $('#confirmation-details').slideDown();
            } else {
                $('#confirmation-details').slideUp();
                // Clear the fields when hiding
                $('#confirmation_date').val('');
                $('#confirmation_parish').val('');
            }
        });
    }

    /**
     * Load and display certificates for a member
     */
    async function loadMemberCertificates(memberId) {
        try {
            console.log('Loading certificates for member:', memberId);
            const response = await window.ParishPortal.API.getCertificates(memberId);
            console.log('Certificate API response:', response);
            
            // Handle the API response format
            let certificates = response;
            if (response.success && response.data) {
                certificates = response.data;
            }
            
            console.log('Processed certificates:', certificates);
            
            // Display certificates for each type
            displayCertificate('baptism', certificates.baptism);
            displayCertificate('first_communion', certificates.first_communion);
            displayCertificate('confirmation', certificates.confirmation);
            
        } catch (error) {
            console.error('Error loading certificates:', error);
        }
    }

    /**
     * Display a certificate in the form
     */
    function displayCertificate(certificateType, certificate) {
        const $currentDiv = $(`#${certificateType}_certificate_current`);
        const $filename = $(`#${certificateType}_certificate_filename`);
        
        if (certificate && certificate.file_name) {
            // Show the current certificate section
            $currentDiv.show();
            
            // Update the filename display
            $filename.text(certificate.file_name);
            
        } else {
            // Hide the current certificate section
            $currentDiv.hide();
        }
    }

    /**
     * Download a certificate file
     */
    async function downloadCertificate(memberId, certificateType) {
        try {
            const result = await window.ParishPortal.API.downloadCertificate(memberId, certificateType);
            console.log('Certificate downloaded successfully:', result);
        } catch (error) {
            console.error('Error downloading certificate:', error);
            window.ParishPortal.Utils.displayError($('#member-form-message'), error.message || 'Failed to download certificate');
        }
    }

    /**
     * Initialize certificate upload handlers
     */
    function initCertificateHandlers() {
        // Handle certificate uploads
        $(document).on('change', '.certificate-upload', async function() {
            const file = this.files[0];
            if (!file) return;
            
            const certificateType = this.name.replace('_certificate', '');
            
            if (!currentEditingMemberId) {
                window.ParishPortal.Utils.displayError($('#member-form-message'), 'Please save the member first before uploading certificates.');
                $(this).val(''); // Clear the file input
                return;
            }
            
            try {
                console.log('Uploading certificate:', certificateType, file.name);
                const result = await window.ParishPortal.API.uploadCertificate(currentEditingMemberId, certificateType, file);
                console.log('Certificate uploaded successfully:', result);
                
                // Refresh the certificate display
                await loadMemberCertificates(currentEditingMemberId);
                
                // Clear the file input
                $(this).val('');
                
                window.ParishPortal.Utils.displaySuccess($('#member-form-message'), 'Certificate uploaded successfully!');
                
            } catch (error) {
                console.error('Error uploading certificate:', error);
                window.ParishPortal.Utils.displayError($('#member-form-message'), error.message || 'Failed to upload certificate');
                $(this).val(''); // Clear the file input
            }
        });
        
        // Handle certificate downloads
        $(document).on('click', '.download-certificate', async function() {
            const certificateType = $(this).data('certificate-type');
            
            if (!currentEditingMemberId) {
                window.ParishPortal.Utils.displayError($('#member-form-message'), 'No member selected.');
                return;
            }
            
            try {
                console.log('Downloading certificate:', certificateType);
                await downloadCertificate(currentEditingMemberId, certificateType);
                
            } catch (error) {
                console.error('Error downloading certificate:', error);
                window.ParishPortal.Utils.displayError($('#member-form-message'), error.message || 'Failed to download certificate');
            }
        });
        
        // Handle certificate removal
        $(document).on('click', '.remove-certificate', async function() {
            if (!confirm('Are you sure you want to remove this certificate?')) {
                return;
            }
            
            const certificateType = $(this).data('certificate-type');
            
            try {
                console.log('Removing certificate:', certificateType);
                await window.ParishPortal.API.deleteCertificate(currentEditingMemberId, certificateType);
                console.log('Certificate removed successfully');
                
                // Refresh the certificate display
                await loadMemberCertificates(currentEditingMemberId);
                
                window.ParishPortal.Utils.displaySuccess($('#member-form-message'), 'Certificate removed successfully!');
                
            } catch (error) {
                console.error('Error removing certificate:', error);
                window.ParishPortal.Utils.displayError($('#member-form-message'), error.message || 'Failed to remove certificate');
            }
        });
    }

    /**
     * Initialize all member functionality
     */
    function init() {
        initMemberForm();
        initAddMemberButton();
        initCancelMemberForm();
        initEditMember();
        initDeleteMember();
        initConditionalFields();
        initModalHandlers();
        initCertificateHandlers();
    }

    // Export functions to global namespace
    window.ParishPortal.Members = {
        init,
        loadHouseholdMembers,
        displayMembersList,
        showMemberForm,
        hideMemberForm,
        resetMemberForm,
        populateMemberFormForEdit,
        editMember,
        initMemberForm,
        initAddMemberButton,
        initCancelMemberForm,
        initEditMember,
        initDeleteMember,
        initConditionalFields,
        loadMemberCertificates,
        displayCertificate,
        downloadCertificate,
        initCertificateHandlers
    };

})(jQuery);
