// app/api/chat/[chatId]/message/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseClient';
import { callGemini } from '@/lib/gemini'; // Import callGemini
import { agents } from '@/lib/agents'; // Import agents
import { Message as VercelChatMessage} from "ai"

export async function POST(
    request: NextRequest,
    context: { params: { chatId: string } }
) {
    const { chatId } = context.params;
    const supabase = createSupabaseAdmin();
    const reqBody = await request.json();
    const { message }: { message: string } = reqBody;  // User's *text* message

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const { data: chatSession, error: chatSessionError } = await supabase
        .from("chat_sessions")
        .select("*, users(name, age)")
        .eq("chat_id", chatId)
        .single();

    if (chatSessionError || !chatSession) {
        return NextResponse.json({ error: "Invalid chat ID" }, { status: 404 });
    }
    const userName = chatSession.users?.name;
    const userAge = chatSession.users?.age;

    const { data: currentAgentData, error: currentAgentError } = await supabase
        .from("chat_sessions")
        .select("current_agent")
        .eq("chat_id", chatId)
        .single();

    if (currentAgentError) {
        return NextResponse.json({ error: "Failed to fetch current agent" }, { status: 500 });
    }

    let currentAgent = currentAgentData?.current_agent || 'nurse';

    // --- Insert *USER* Message ---
    const { error: userMessageError } = await supabase
        .from("messages")
        .insert([
            {
                chat_session_id: chatSession.id,
                sender_type: "user",
                sender_name: userName,
                message_text: message,
            },
        ]);

    if (userMessageError) {
        console.error("Error inserting user message:", userMessageError);
        return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
    }

    // Fetch history *before* agent/interpreter calls
    const { data: chatHistory, error: historyError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', chatSession.id)
        .order('sent_at', { ascending: true });

    if (historyError) {
        console.error('Error fetching chat history:', historyError);
        return NextResponse.json({ message: 'Failed to fetch chat history' }, { status: 500 });
    }

    // --- Current Agent Response ---  // Pass the user message to callGemini
    let agentResponse = await callGemini(currentAgent, chatHistory!, message);

    // Handle [FOR USER] for the current agent
    if (agentResponse.text.startsWith("[FOR USER]")) {
        const userMessage = agentResponse.text.substring("[FOR USER]".length).trim();
        const { error: agentMessageError } = await supabase.from("messages").insert([
            {
                chat_session_id: chatSession.id,
                sender_type: currentAgent,
                sender_name: currentAgent,
                message_text: userMessage,
                formatted_data: agentResponse.formattedData,
            },
        ]);
        if (agentMessageError) {
            console.error("Error inserting agent response:", agentMessageError);
        }
    }

    // --- Handle "Suggest:" for the current agent (primarily for Nurse)---
    let nextAgent = currentAgent; // Keep current agent by default.

    if (agentResponse.text.startsWith("Suggest:")) {
        let suggestedAgent = agentResponse.text.substring("Suggest:".length).trim().toLowerCase().replace(/\s+/g, '_');

        if (Object.keys(agents).includes(suggestedAgent)) {
            nextAgent = suggestedAgent;
            //Agent switching message.
            const agentDisplayName = nextAgent.replace(/_/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            let agentChangeMessage = `${agentDisplayName} has joined the chat.`;

            const { error: updateChatError } = await supabase
            .from('chat_sessions')
            .update({ current_agent: nextAgent })
            .eq('id', chatSession.id);

            if (updateChatError) {
                console.error('Failed to update current agent:', updateChatError);
                return NextResponse.json({ error: "Failed to update current agent" }, { status: 500 });
            }

            const { error: notificationError } = await supabase.from('messages').insert([
            {
                chat_session_id: chatSession.id,
                sender_type: 'system',
                sender_name: 'System',
                message_text: agentChangeMessage,
            },
            ]);
            if (notificationError) {
                console.error('Error inserting notification message:', notificationError);
            }
            //Refetch chat history.
            const { data: updatedChatHistory, error: updatedHistoryError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_session_id', chatSession.id)
                .order('sent_at', { ascending: true });

            if (updatedHistoryError) {
                console.error('Error re-fetching chat history:', updatedHistoryError);
                return NextResponse.json({message: 'Failed to refetch chat history'}, {status: 500}); // Critical error
            }

            // --- Call New Agent ---
            const newAgentResponse = await callGemini(nextAgent, updatedChatHistory!);
            // Check for [FOR USER] tag for the new agent's initial message
            if (newAgentResponse.text.startsWith("[FOR USER]")) {
                    const userMessage = newAgentResponse.text.substring("[FOR USER]".length).trim();
                    const { error: newAgentMessageError } = await supabase.from('messages').insert([
                    {
                        chat_session_id: chatSession.id,
                        sender_type: nextAgent,
                        sender_name: nextAgent,
                        message_text: userMessage, //Insert user specific message.
                        formatted_data: newAgentResponse.formattedData,
                    },
                ]);
                if (newAgentMessageError) {
                    console.error("Error inserting new agent's initial message:", newAgentMessageError);
                }
            }

        }
    }  else {
        // --- Call Interpreter ---
        const interpreterResponse = await callGemini("interpreter", [], message); // Pass ONLY the user message.
        const suggestedAgent = interpreterResponse.text.trim();

        if (suggestedAgent && Object.keys(agents).includes(suggestedAgent)) {
            nextAgent = suggestedAgent;

            const agentDisplayName = nextAgent.replace(/_/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                let agentChangeMessage = `${agentDisplayName} has joined the chat.`;

                const { error: updateChatError } = await supabase
                .from('chat_sessions')
                .update({ current_agent: nextAgent })
                .eq('id', chatSession.id);

                if (updateChatError) {
                    console.error('Failed to update current agent:', updateChatError);
                    return NextResponse.json({ error: "Failed to update current agent" }, { status: 500 });
                }

                const { error: notificationError } = await supabase.from('messages').insert([
                {
                    chat_session_id: chatSession.id,
                    sender_type: 'system',
                    sender_name: 'System',
                    message_text: agentChangeMessage,
                },
                ]);
                if (notificationError) {
                    console.error('Error inserting notification message:', notificationError);
                }
            //Refetch chat history.
            const { data: updatedChatHistory, error: updatedHistoryError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_session_id', chatSession.id)
                .order('sent_at', { ascending: true });

            if (updatedHistoryError) {
                console.error('Error re-fetching chat history:', updatedHistoryError);
                return NextResponse.json({message: 'Failed to refetch chat history'}, {status: 500}); // Critical error
            }

            // --- Call New Agent ---
            const newAgentResponse = await callGemini(nextAgent, updatedChatHistory!);

            // Check for [FOR USER] tag for the new agent's initial message
            if (newAgentResponse.text.startsWith("[FOR USER]")) {
                const userMessage = newAgentResponse.text.substring("[FOR USER]".length).trim();
                const { error: newAgentMessageError } = await supabase.from('messages').insert([
                    {
                        chat_session_id: chatSession.id,
                        sender_type: nextAgent,
                        sender_name: nextAgent,
                        message_text: userMessage, //Insert user specific message.
                        formatted_data: newAgentResponse.formattedData,
                    },
                ]);
                if (newAgentMessageError) {
                    console.error("Error inserting new agent's initial message:", newAgentMessageError);
                }
            }

        }
    }

    return NextResponse.json({ success: true, nextAgent: nextAgent, userName, userAge }, { status: 200 });
}