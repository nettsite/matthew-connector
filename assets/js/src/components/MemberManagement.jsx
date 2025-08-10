import React, { useState } from 'react';

export const MemberManagement = ({ household }) => {
    const [members, setMembers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        baptised: false,
        baptismDate: '',
        baptismParish: '',
        firstCommunion: false,
        firstCommunionDate: '',
        firstCommunionParish: '',
        confirmed: false,
        confirmationDate: '',
        confirmationParish: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${matthewPortalSettings.apiUrl}/api/households/${household.id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('matthew_household_token')}`
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const result = await response.json();
            if (result.data.createMember.success) {
                setMembers([...members, result.data.createMember.member]);
                setShowAddForm(false);
                setFormData({}); // Reset form
            }
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    return (
        <div className="member-management">
            <h2>{household.name} - Family Members</h2>
            
            {members.length > 0 ? (
                <div className="members-list">
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <h3>{member.firstName} {member.lastName}</h3>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No members added yet</p>
            )}

            {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)}>
                    Add Family Member
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="add-member-form">
                    <h3>Add New Family Member</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name*</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name*</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Sacraments Section */}
                    <div className="sacraments-section">
                        <h4>Sacraments</h4>
                        
                        <div className="sacrament-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.baptised}
                                    onChange={e => setFormData({...formData, baptised: e.target.checked})}
                                />
                                Baptised
                            </label>
                            {formData.baptised && (
                                <>
                                    <input
                                        type="date"
                                        placeholder="Baptism Date"
                                        onChange={e => setFormData({...formData, baptismDate: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Parish"
                                        onChange={e => setFormData({...formData, baptismParish: e.target.value})}
                                    />
                                </>
                            )}
                        </div>

                        <div className="sacrament-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.firstCommunion}
                                    onChange={e => setFormData({...formData, firstCommunion: e.target.checked})}
                                />
                                First Communion
                            </label>
                            {formData.firstCommunion && (
                                <>
                                    <input
                                        type="date"
                                        placeholder="First Communion Date"
                                        onChange={e => setFormData({...formData, firstCommunionDate: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Parish"
                                        onChange={e => setFormData({...formData, firstCommunionParish: e.target.value})}
                                    />
                                </>
                            )}
                        </div>

                        <div className="sacrament-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.confirmed}
                                    onChange={e => setFormData({...formData, confirmed: e.target.checked})}
                                />
                                Confirmation
                            </label>
                            {formData.confirmed && (
                                <>
                                    <input
                                        type="date"
                                        placeholder="Confirmation Date"
                                        onChange={e => setFormData({...formData, confirmationDate: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Parish"
                                        onChange={e => setFormData({...formData, confirmationParish: e.target.value})}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit">Add Member</button>
                        <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};
