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

            if (response.success && response.data) {
                displayMembersList(response.data);
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
        
        const $membersList = $('#member-list');
        $membersList.empty();
        
        if (!members || members.length === 0) {
            $membersList.html('<p>No family members added yet. Use the form above to add members.</p>');
            return;
        }
        
        members.forEach(function(member) {
            const memberHtml = `
                <div class="member-item" data-member-id="${member.id}">
                    <div class="member-info">
                        <h4>${member.first_name} ${member.last_name}</h4>
                        <div class="member-details">
                            <p><strong>Email:</strong> ${member.email || 'Not provided'}</p>
                            <p><strong>Phone:</strong> ${member.phone || 'Not provided'}</p>
                            <p><strong>Occupation:</strong> ${member.occupation || 'Not provided'}</p>
                            ${member.skills ? `<p><strong>Skills:</strong> ${member.skills}</p>` : ''}
                            ${member.baptised ? '<p><strong>Baptised:</strong> Yes' +
                                (member.baptism_date ? ` on ${window.ParishPortal.Utils.formatDate(member.baptism_date)}` : '') +
                                (member.baptism_parish ? ` at ${member.baptism_parish}` : '') + '</p>' : 
                                '<p><strong>Baptised:</strong> No</p>'}
                            ${member.first_communion ? '<p><strong>First Communion:</strong> Yes' +
                                (member.first_communion_date ? ` on ${window.ParishPortal.Utils.formatDate(member.first_communion_date)}` : '') +
                                (member.first_communion_parish ? ` at ${member.first_communion_parish}` : '') + '</p>' : 
                                '<p><strong>First Communion:</strong> No</p>'}
                            ${member.confirmed ? '<p><strong>Confirmed:</strong> Yes' +
                                (member.confirmation_date ? ` on ${window.ParishPortal.Utils.formatDate(member.confirmation_date)}` : '') +
                                (member.confirmation_parish ? ` at ${member.confirmation_parish}` : '') + '</p>' : 
                                '<p><strong>Confirmed:</strong> No</p>'}
                        </div>
                    </div>
                    <div class="member-actions">
                        <button type="button" class="edit-member" data-member-id="${member.id}">Edit</button>
                        <button type="button" class="delete-member" data-member-id="${member.id}">Delete</button>
                    </div>
                </div>
            `;
            $membersList.append(memberHtml);
        });
    }

    /**
     * Show member form for adding/editing
     */
    function showMemberForm() {
        $('#member-form').removeClass('hidden');
        $('#add-member-btn').addClass('hidden');
    }

    /**
     * Hide member form
     */
    function hideMemberForm() {
        $('#member-form').addClass('hidden');
        $('#add-member-btn').removeClass('hidden');
        resetMemberForm();
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
        
        $('#member_first_communion').prop('checked', member.first_communion || false);
        $('#first_communion_date').val(member.first_communion_date || '');
        $('#first_communion_parish').val(member.first_communion_parish || '');
        
        $('#member_confirmed').prop('checked', member.confirmed || false);
        $('#confirmation_date').val(member.confirmation_date || '');
        $('#confirmation_parish').val(member.confirmation_parish || '');
        
        $('#member-form input[type="submit"]').val('Update Member');
        $('#member-form h3').text('Edit Family Member');
        
        showMemberForm();
        $('#member-form')[0].scrollIntoView({ behavior: 'smooth' });
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
            const $submitButton = $form.find('input[type="submit"]');
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
        $('#cancel-member-form').off('click').on('click', function() {
            hideMemberForm();
        });
    }

    /**
     * Initialize edit member functionality
     */
    function initEditMember() {
        $(document).off('click', '.edit-member').on('click', '.edit-member', async function() {
            const memberId = $(this).data('member-id');
            
            // For now, we'll extract the member data from the display
            // In a more robust implementation, you might want to store the member data
            // or make an API call to get the full member details
            
            try {
                // Get all members and find the one being edited
                const response = await window.ParishPortal.API.getMembers();
                if (response.success && response.data) {
                    const member = response.data.find(m => m.id == memberId);
                    if (member) {
                        populateMemberFormForEdit(member);
                    } else {
                        window.ParishPortal.Utils.displayError($('#members-message'), 'Member not found');
                    }
                }
            } catch (error) {
                console.error('Error loading member for edit:', error);
                window.ParishPortal.Utils.displayError($('#members-message'), 'Failed to load member data');
            }
        });
    }

    /**
     * Initialize delete member functionality
     */
    function initDeleteMember() {
        $(document).off('click', '.delete-member').on('click', '.delete-member', async function() {
            const memberId = $(this).data('member-id');
            const memberName = $(this).closest('.member-item').find('h4').text();
            
            if (!confirm(`Are you sure you want to delete ${memberName}?`)) {
                return;
            }
            
            try {
                console.log('Deleting member:', memberId);
                
                const response = await window.ParishPortal.API.deleteMember(memberId);
                
                console.log('Member delete response:', response);
                
                if (response.success) {
                    window.ParishPortal.Utils.displaySuccess($('#members-message'), 'Family member deleted successfully!');
                    await loadHouseholdMembers(); // Refresh the members list
                } else {
                    throw new Error(response.message || 'Failed to delete family member');
                }
            } catch (error) {
                console.error('Member delete error:', error);
                window.ParishPortal.Utils.displayError($('#members-message'), error.responseJSON || error);
            }
        });
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
     * Initialize all member functionality
     */
    function init() {
        initMemberForm();
        initAddMemberButton();
        initCancelMemberForm();
        initEditMember();
        initDeleteMember();
        initConditionalFields();
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
        initMemberForm,
        initAddMemberButton,
        initCancelMemberForm,
        initEditMember,
        initDeleteMember,
        initConditionalFields
    };

})(jQuery);
