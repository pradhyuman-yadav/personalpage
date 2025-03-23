// components/LawChatWindow.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface LawChatWindowProps {
    promptId: string | null;
}
const LawChatWindow: React.FC<LawChatWindowProps> = ({promptId}) => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    //Fetch history when prompt id changes.
    useEffect(() => {
        const fetchHistory = async () => {
            if(!promptId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/prompt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promptId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.history) {
                        const parsed = parseHistory(data.history);
                        setMessages(parsed);
                    } else {
                        setMessages([]);
                    }
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || "Failed to fetch history");
                }
            } catch (error) {
                setError(`An unexpected error occurred. ${(error as Error).message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory()

    }, [promptId]);

    useEffect(() => {
        scrollToBottom()
      }, [messages]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };
    const parseHistory = (historyArray: string[]) => {
        const parsedHistory: { role: "user" | "assistant"; content: string }[] = [];
        for (let i = 0; i < historyArray.length; i += 2) {
          const userTurn = historyArray[i];
          const assistantTurn = historyArray[i + 1];

          if (userTurn && assistantTurn) {
            parsedHistory.push({
              role: userTurn.startsWith("User:") ? "user" : "assistant",
              content: userTurn.replace(/^User: |^Assistant: /, ""),
            } as { role: "user" | "assistant"; content: string });
            parsedHistory.push({
              role: assistantTurn.startsWith("User:") ? "user" : "assistant",
              content: assistantTurn.replace(/^User: |^Assistant: /, ""),
            } as { role: "user" | "assistant"; content: string });
          }
        }
        return parsedHistory;
      };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);

        // Optimistically add the user's message
        setMessages((prevMessages) => [...prevMessages, { role: "user", content: input }]);
        setInput(""); // Clear the input field

        try {
            const response = await fetch("/api/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    promptId,
                    userQuestion: input,
                    userLocation: location // Pass user location
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get response");
            }

            const data = await response.json();
             // Update messages with the response from Gemini.
             setMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: data.result }, // Add AI response
            ]);

        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
            scrollToBottom(); // Scroll to the bottom after adding a message
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex-grow overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>Law Advisor</div>
                    <div className="text-sm text-gray-500">
                        Prompt ID: {promptId || 'Loading...'}
                    </div>
                </div>
                <div className="p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                    key={index}
                    className={`flex my-2 ${
                        msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                    }`}
                    >
                    <div
                        className={`max-w-[75%] rounded-lg p-2 ${
                        msg.role === 'user'
                            ? 'bg-blue-500 text-white ml-auto rounded-br-none'
                            : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                        }`}
                    >
                         <Badge variant="secondary" className="mr-1">
                                {msg.role === "user" ? "You" : "Law Advisor"}
                            </Badge>
                        {msg.content}
                    </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-2 p-4">
                        <div className='space-y-2'>
                            <Skeleton className="w-[180px] h-[30px] rounded-full" />
                            <Skeleton className="w-[250px] h-[20px] rounded-full" />
                        </div>
                    </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-200">
                <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your question..."
                className="flex-grow mr-4"
                disabled={loading}
                />
                <Button type="submit" disabled={loading} variant="default">
                Send
                </Button>
            </form>
            {error && <div className="text-red-500 p-4">{error}</div>}
        </div>
    )
}
export default LawChatWindow;