// components/ChatWindow.tsx (ChatWindow - Client Component)
"use client"
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
    chatId: string;
    initialMessages: Message[]; // Receive initial messages as a prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, initialMessages }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages); // Initialize with initialMessages
    const [nextAgent, setNextAgent] = useState<string | null>(null); // Track the next agent
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }

    // No initial fetch here - we already have the initial data

    useEffect(() => {
        scrollToBottom()
      }, [messages]);

    const handleSendMessage = async (messageText: string) => {
      setLoading(true);
        try {
            const response = await fetch(`/api/chat/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
            }

            const { nextAgent } = await response.json(); // Get nextAgent
            setNextAgent(nextAgent); // Update state
              // Fetch chat history
            const historyResponse = await fetch(`/api/chat/${chatId}/history`);
                if (!historyResponse.ok) {
                    throw new Error(`Failed to fetch chat history: ${historyResponse.status}`);
                }
                const data = await historyResponse.json();
                setMessages(data);

        } catch (error) {
            console.error(error);
            // Handle error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-grow overflow-y-auto">
                {/* Display current agent */}
                <div className="p-4 bg-gray-100 border-b">
                    Chatting with: {nextAgent ? nextAgent.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Nurse'}
                </div>
                <div className="p-4">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                     <div ref={messagesEndRef} />
                </div>
            </div>
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
    );
};

export default ChatWindow;