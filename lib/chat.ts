// lib/chat.ts
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { Message } from "@/lib/types";

export async function getChatHistory(chatId: string): Promise<Message[]> {
    const supabase = createSupabaseAdmin();
    const { data: chatSession, error: chatSessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('chat_id', chatId)
        .single();

    if (chatSessionError || !chatSession) {
        console.error("Chat session error:", chatSessionError);
        return []; // Or throw an error, as appropriate
    }

    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', chatSession.id)
        .order('sent_at', { ascending: true });

    if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return []; // Or throw an error
    }
    return messages || [];
}