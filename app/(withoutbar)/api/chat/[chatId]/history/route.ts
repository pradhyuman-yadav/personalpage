// app/api/chat/[chatId]/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, context: { params: Promise<{ chatId: string }> }) {
    const { chatId } = (await context.params);
    const supabase = createSupabaseAdmin();

    const { data: chatSession, error: chatSessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('chat_id', chatId)
        .single();

    if (chatSessionError || !chatSession) {
        return NextResponse.json({ error: 'Invalid chat ID' }, { status: 404 });
    }

    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', chatSession.id)
        .order('sent_at', { ascending: true });

    if (messagesError) {
        console.error('Error fetching chat history:', messagesError);
        return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
    }

    return NextResponse.json(messages, { status: 200 });
}