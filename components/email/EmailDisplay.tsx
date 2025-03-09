// components/EmailDisplay.tsx (No changes)
import React from 'react';

interface EmailDisplayProps {
    email: string;
    expiresAt: Date | null;
}

const EmailDisplay: React.FC<EmailDisplayProps> = ({ email, expiresAt }) => {
    return (
        <div className="mt-4 p-4 border rounded-md shadow-sm">
            <p className="text-lg">
                Your temporary email address: <span className="font-bold text-blue-600">{email}</span>
            </p>
            {expiresAt && (
                <p className="text-sm text-gray-500">
                    Expires at: {expiresAt.toLocaleString()}
                </p>
            )}
        </div>
    );
};

export default EmailDisplay;