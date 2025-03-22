// components/ChatMessage.tsx

import { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {

    const getSenderName = (sender_type: string, sender_name: string) =>{
        if(sender_type === "user"){
            return "You"
        }
        return sender_name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    const isUser = message.sender_type === 'user';

  return (
    <div
      className={`flex flex-col my-2 ${
        isUser ? 'items-end self-end' : 'items-start self-start'
      }`}
    >
        <div className={`text-xs ${isUser? 'text-gray-500 mr-1' : 'text-gray-500 ml-1'}`}>{getSenderName(message.sender_type, message.sender_name)}</div>
      <div
        className={`max-w-xs rounded-lg p-2 ${
          isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}      >
        <p>{message.message_text}</p>
      </div>
        {message.formatted_data &&
            <pre className="text-xs bg-gray-100 p-1 rounded-md mt-1">
                {JSON.stringify(message.formatted_data, null, 2)}
            </pre>
        }
    </div>
  );
};

export default ChatMessage;