// components/ChatMessage.tsx
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils"; // Import the cn utility

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getSenderName = (sender_type: string, sender_name: string) => {
    if (sender_type === "user") {
      return "You";
    }
    return sender_name
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isUser = message.sender_type === "user";

  return (
    <div
      className={cn(
        "flex my-2",
        isUser ? "justify-end" : "justify-start" // Use justify for flex alignment
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-2", // Limit max width, use a single rounded class
          isUser
            ? "bg-blue-500 text-white ml-auto rounded-br-none" // ml-auto for right alignment
            : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none" // mr-auto for left alignment
        )}
      >
        <div className="text-xs">{getSenderName(message.sender_type, message.sender_name)}</div>
        <p>{message.message_text}</p>
        {message.formatted_data && (
          <pre className="text-xs p-1 rounded-md mt-1">
            {JSON.stringify(message.formatted_data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;