// components/Inbox.tsx (Corrected)
import { useEffect, useState } from 'react';

interface Message {
    id: string;
    sender: string;
    subject: string;
    body: string;
    received_at: string;
}

interface InboxProps {
    emailId: string;
}

export default function Inbox({ emailId }: InboxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!emailId) {
                setLoading(false); // Nothing to fetch yet
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const baseUrl = window.location.origin;
                const messagesUrl = new URL(`/api/supabaseProxy/messages/select/*/where/email_id/eq/${emailId}/order/received_at/desc`, baseUrl).toString();
                const response = await fetch(messagesUrl);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Failed to fetch messages');
                    return; // Stop if there's an error
                }
                setMessages(data || []);


            } catch (err: unknown) {
                setError(String(err) || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (emailId) {
          fetchMessages();  // Fetch immediately when emailId is available
          const intervalId = setInterval(fetchMessages, 5000); // And then every 5 seconds
          return () => clearInterval(intervalId);
        }
    }, [emailId]);

    if (loading) {
        return <div className="mt-4 p-4 border rounded-md shadow-sm">Loading messages...</div>;
    }

    if (error) {
        return <div className="mt-4 p-4 border rounded-md shadow-sm text-red-500">Error: {error}</div>;
    }

    return (
        <div className="mt-4 p-4 border rounded-md shadow-sm">
            <h2 className="text-xl font-bold mb-4">Inbox for {emailId}</h2>
             {messages.length === 0 ? (
                <p>No messages yet.</p>
            ) : (
                <ul>
                    {messages.map((message) => (
                         <li key={message.id} className="mb-4 p-4 border rounded-md shadow-sm">
                            <p>
                                <strong>From:</strong> {message.sender}
                            </p>
                            <p>
                                <strong>Subject:</strong> {message.subject}
                            </p>
                            <p>
                                <strong>Received:</strong> {new Date(message.received_at).toLocaleString()}
                            </p>
                            <p className="mt-2">{message.body}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}