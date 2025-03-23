// components/ChatMessage.tsx

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils"; // Import the cn utility (make sure you have this!)
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getSenderName = (sender_type: string, sender_name: string) => {
    if (sender_type === "user") {
      return "You";
    }
    if (sender_type === "system") {
      return ""; // Don't display "System:" for system messages, just the message
    }
    return sender_name
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isUser = message.sender_type === "user";
  const isSystem = message.sender_type === "system";

  return (
    <div
      className={cn(
        "flex my-2",
        isUser ? "justify-end" : "justify-start", // Keep user/agent alignment
        isSystem && "justify-center" // Override for system messages: center them
      )}
    >
      {/* Conditional Rendering for System Messages */}
      {isSystem ? (
        <div className="text-xs text-gray-500 text-center">
          {message.message_text}
        </div>
      ) : (
        <>
          {/* Display avatar for non-system messages (agents) */}
          {!isUser && (
            <Avatar className="mr-2">
                <AvatarImage src={`https://github.com/shadcn.png`} alt={message.sender_type} />
                <AvatarFallback>{message.sender_type.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "max-w-[75%] rounded-lg p-2",
              isUser
                ? "bg-blue-500 text-white ml-auto rounded-br-none"
                : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
            )}
          >
            <div className="text-xs text-gray-500">
                {getSenderName(message.sender_type, message.sender_name)}
            </div>
            <p>{message.message_text}</p>
             {/*Keep if you want to see the formatted data in chat*/}
            {message.formatted_data && (
              <pre className="text-xs  p-1 rounded-md mt-1">
                {JSON.stringify(message.formatted_data, null, 2)}
              </pre>
            )}
          </div>
            {/*This is for user Avatar*/}
            {isUser && (
                <Avatar className="ml-2">
                    <AvatarImage src={`/user.png`} alt={message.sender_type} />
                    <AvatarFallback>{"U"}</AvatarFallback>
                </Avatar>
            )}
        </>
      )}
    </div>
  );
};

export default ChatMessage;