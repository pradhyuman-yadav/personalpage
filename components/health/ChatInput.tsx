// components/ChatInput.tsx
"use client";
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input" // Import shadcn Input
import { Button } from "@/components/ui/button" // Import shadcn Button


interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>; // onSendMessage is async
  disabled?: boolean;
  setRetryAfter: (seconds: number | null) => void; // Add setRetryAfter prop
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false, setRetryAfter }) => {
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null); // Local countdown

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim() && !disabled && countdown === null) {
      // onSendMessage is now awaited
      await onSendMessage(message);
      setMessage('');
    }
  };


    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (countdown !== null && countdown > 0) {
            intervalId = setInterval(() => {
                setCountdown((prevCountdown) => (prevCountdown !== null ? prevCountdown - 1 : null));
            }, 1000);
        } else if (countdown === 0) {
            setRetryAfter(null); // Reset retryAfter when countdown finishes
            setCountdown(null);
        }
        return () => clearInterval(intervalId);
    }, [countdown, setRetryAfter]);


  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-200">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={countdown !== null ? `Wait ${countdown} seconds...` : "Type your message..."}
        disabled={disabled || countdown !== null}
        className="flex-grow mr-4"
      />
      <Button
        type="submit"
        disabled={disabled || !message.trim() || countdown !== null}
        variant="default"
      >
        Send
      </Button>
    </form>
  );
};

export default ChatInput;