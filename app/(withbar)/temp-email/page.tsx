// app/page.tsx (Corrected)
"use client";
import { useState, useEffect } from 'react';
import EmailDisplay from '@/components/email/EmailDisplay';
import Inbox from '@/components/email/Inbox';
import { Button } from "@/components/ui/button";

export default function Home() {
    const [email, setEmail] = useState('');
    const [emailId, setEmailId] = useState('');  // Use email ID, not the address, for fetching messages
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateEmail = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/email`, { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
                setEmail(data.email);
                // Do NOT set emailId here.  Get it in the useEffect.
                setExpiresAt(new Date(data.expiresAt));
            } else {
                setError(data.error || 'Failed to generate email');
            }
        } catch (err: unknown) {
            setError(String(err) || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch the email ID *after* the email address is set
    useEffect(() => {
        const fetchEmailId = async () => {
            if (!email) return;

            setLoading(true);
            setError(null);
            try {
                const baseUrl = window.location.origin;
                const response = await fetch(`${baseUrl}/api/supabaseProxy/emails/select/id/where/address/eq/${encodeURIComponent(email)}/order/created_at/desc/limit/1`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch email ID");
                }

                // Check if data is empty (email not found yet)
                if (data.length > 0) {
                    setEmailId(data[0].id); // Set the email ID!
                }

            } catch (err: unknown) {
                setError(String(err) || 'An error occurred while fetching email ID');
            } finally {
                setLoading(false);
            }
        };
      fetchEmailId();

        // Set up interval to refetch email ID (in case of race conditions)
        const intervalId = setInterval(fetchEmailId, 5000);

        return () => clearInterval(intervalId);
    }, [email]); // Run this effect when `email` changes


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Temporary Email Generator</h1>

            <Button
                onClick={handleGenerateEmail}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Email'}
            </Button>

            {error && <div className="text-red-500 mt-2">{error}</div>}

            {email && (
                <>
                    <EmailDisplay email={email} expiresAt={expiresAt} />
                    <Inbox emailId={emailId} /> {/* Pass the emailId */}
                </>
            )}
        </div>
    );
}