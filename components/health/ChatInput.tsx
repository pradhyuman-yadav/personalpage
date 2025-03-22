// components/ChatInput.tsx
"use client";
import { useState } from 'react';
import { Input } from "@/components/ui/input" // Import shadcn Input
import { Button } from "@/components/ui/button" // Import shadcn Button


interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-200">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-grow mr-4" // Use mr-4 for spacing, and remove rounded-full
      />
      <Button
        type="submit"
        disabled={disabled || !message.trim()}
        variant="default" // Use a standard button variant
      >
        Send
      </Button>
    </form>
  );
};

export default ChatInput;