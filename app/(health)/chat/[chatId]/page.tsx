// app/chat/[chatId]/page.tsx

import ChatWindow from '@/components/health/ChatWindow';
import { createSupabaseAdmin } from '@/lib/supabaseClient';
import { Message } from '@/lib/types';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

async function getChatHistory(chatId: string): Promise<Message[]> {
  const supabase = createSupabaseAdmin();

  const { data: chatSession, error: chatSessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('chat_id', chatId)
    .single();

  if (chatSessionError || !chatSession) {
    console.error("Chat session error:", chatSessionError);
    return [];
  }

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_session_id', chatSession.id)
    .order('sent_at', { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return [];
  }

  return messages || [];
}

export default async function ChatPage({ params }: ChatPageProps) {
  // Access dynamic param only inside the function body
  const chatId = params.chatId;
  const initialMessages = await getChatHistory(chatId);

  return (
    <div>
      <ChatWindow chatId={chatId} initialMessages={initialMessages} />
    </div>
  );
}
