// components/ChatWindow.tsx
"use client"
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
import { Badge } from "@/components/ui/badge";

interface ChatWindowProps {
    chatId: string;
    initialMessages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, initialMessages }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [nextAgent, setNextAgent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userName, setUserName] = useState<string | null>(null); // State for user name
    const [userAge, setUserAge] = useState<number | null>(null);   // State for user age
    const [retryAfter, setRetryAfter] = useState<number | null>(null); // Add retryAfter state

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }

    useEffect(() => {
        scrollToBottom()
      }, [messages]);

    const handleSendMessage = async (messageText: string) => {
      setLoading(true);

        // Optimistically add the user's message to the UI *immediately*
        const newUserMessage: Message = {
            id: `temp-${Date.now()}`, // Use a temporary ID.  The server will provide the real ID.
            chat_session_id: `temp-${Date.now()}`,
            sender_type: "user",
            sender_name: userName || "You", // Use "You" if userName is not yet available
            message_text: messageText,
            sent_at: new Date().toISOString(), // Use current time
            formatted_data: null, // No formatted data for user messages
        };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);


        try {
            const response = await fetch(`/api/chat/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (response.status === 429) { // Rate limit exceeded
                const retryAfterSeconds = parseInt(response.headers.get('Retry-After') || '60', 10); // Default to 60 seconds
                setRetryAfter(retryAfterSeconds); // Set the retryAfter state
                 // Remove the optimistic message
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== newUserMessage.id));
                return; // Stop processing
            }

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
            }

            const data = await response.json(); // Get all data from response
            const { nextAgent,  userName, userAge } = data; // Removed interpreterOutput
            setNextAgent(nextAgent); // Update next agent
            if(userName) setUserName(userName); // Update the user name
            if(userAge) setUserAge(userAge); // Update the user age

              // Fetch chat history
            const historyResponse = await fetch(`/api/chat/${chatId}/history`);
                if (!historyResponse.ok) {
                    throw new Error(`Failed to fetch chat history: ${historyResponse.status}`);
                }
                const dataHistory = await historyResponse.json();
                setMessages(dataHistory); // Update with *server-provided* messages, replacing temporary ones

        } catch (error) {
            console.error(error);
             setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newUserMessage.id));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex-grow overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        Chatting with: {nextAgent ? nextAgent.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Nurse'}
                    </div>
                     {/* Display user info */}
                    <div className="text-sm text-gray-500">
                        Chat ID: {chatId} | Name: {userName || 'Loading...'} | Age: {userAge || 'Loading...'}
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {messages.map((message) => (
                       <div
                        key={message.id}
                        className={`flex items-start gap-2 p-4 ${
                            message.sender_type === 'user'
                                ? 'justify-end'
                                : message.sender_type === 'system'
                                ? 'justify-center' // Center system messages
                                : 'justify-start'
                        }`}
                    >
                        {message.sender_type !== 'user' && message.sender_type !== 'system' && (
                            <Avatar>
                                <AvatarImage src={`/${message.sender_type}.png`} alt={message.sender_type} />
                                <AvatarFallback>{message.sender_type.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={`rounded-lg px-3 py-2 ${
                                message.sender_type === 'user'
                                    ? 'bg-blue-500 text-white ml-auto' // User message styling
                                    : message.sender_type === 'system'
                                    ? 'text-xs text-gray-500' // System message styling (no background)
                                    : 'bg-gray-100 text-gray-800' // AI message styling
                            }`}
                        >

                        {message.sender_type !== 'system' && (
                            <Badge variant="secondary" className="mr-1">
                                {message.sender_type === "user" ? "You" : message.sender_name}
                            </Badge>
                        )}
                            {message.message_text}
                        </div>
                        {/*This is for user Avatar*/}
                        {message.sender_type === 'user' && (
                            <Avatar className="ml-2">
                                <AvatarImage src={`/user.png`} alt={message.sender_type} />
                                <AvatarFallback>{"U"}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    ))}

                     {/* Loading Skeleton (placed *after* messages, so it appears at the bottom) */}
                    {loading && (
                         <div className="flex items-start gap-2 p-4">
                            <Avatar>
                                <AvatarImage src={`/${nextAgent}.png`} alt={nextAgent || "agent"} />
                                <AvatarFallback>{nextAgent? nextAgent.slice(0, 2).toUpperCase() : "AG"}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Skeleton className="w-[180px] h-[30px] rounded-full" />
                                <Skeleton className="w-[250px] h-[20px] rounded-full" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} setRetryAfter={setRetryAfter}/>
        </div>
    );
};

export default ChatWindow;