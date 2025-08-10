import React, { useState } from 'react';
import { HouseholdRegistration } from './HouseholdRegistration';
import { MemberManagement } from './MemberManagement';

export const ParishPortal = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [household, setHousehold] = useState(null);

    const handleRegistrationSuccess = (newHousehold) => {
        setHousehold(newHousehold);
        setIsRegistered(true);
    };

    return (
        <div className="parish-portal">
            {!isRegistered ? (
                <HouseholdRegistration onSuccess={handleRegistrationSuccess} />
            ) : (
                <MemberManagement household={household} />
            )}
        </div>
    );
};
