// app/api/chat/[chatId]/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { callGemini } from "@/lib/gemini";
import { agents } from "@/lib/agents";

export async function POST(
  request: NextRequest,
  context: { params: { chatId: string } }
) {
  const { chatId } = context.params;
  const supabase = createSupabaseAdmin();
  const reqBody = await request.json();
  const { message }: { message: string } = reqBody;

  console.log('Received message:', message);

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 1. Get Chat Session
  const { data: chatSession, error: chatSessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (chatSessionError || !chatSession) {
    return NextResponse.json({ error: "Invalid chat ID" }, { status: 404 });
  }

  // 2. Get Current Agent
  const { data: currentAgentData, error: currentAgentError } = await supabase
    .from("chat_sessions")
    .select("current_agent")
    .eq("chat_id", chatId)
    .single();

  if (currentAgentError) {
    return NextResponse.json({ error: "Failed to fetch current agent" }, { status: 500 });
  }

  let currentAgent = currentAgentData?.current_agent || 'nurse';
  console.log("Current Agent:", currentAgent);

  // 3. Insert User Message
  const { error: userMessageError } = await supabase
    .from("messages")
    .insert([
      {
        chat_session_id: chatSession.id,
        sender_type: "user",
        sender_name: chatSession.user_id, //  get the user's name from  `users` table if needed
        message_text: message,
      },
    ]);

  if (userMessageError) {
    console.error("Error inserting user message:", userMessageError);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }

  // 4. Fetch Chat History
  const { data: chatHistory, error: historyError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_session_id', chatSession.id)
    .order('sent_at', { ascending: true });

  if (historyError) {
    console.error('Error fetching chat history:', historyError);
    return NextResponse.json({ message: 'Failed to fetch chat history' }, { status: 500 });
  }

  // 5. Call Gemini
  console.log("Calling callGemini with agent:", currentAgent);
  const geminiResponse = await callGemini(currentAgent, chatHistory);
  console.log("Raw Gemini Response:", geminiResponse);

    // 6. Insert Gemini Response into Supabase
    const { error: geminiMessageError } = await supabase.from("messages").insert([
        {
          chat_session_id: chatSession.id,
          sender_type: currentAgent, // Use current agent type
          sender_name: currentAgent, // Use current agent, or lookup agent details
          message_text: geminiResponse.text,
          formatted_data: geminiResponse.formattedData,
        },
      ]);

  if (geminiMessageError) {
    console.error("Error inserting Gemini response:", geminiMessageError);
    return NextResponse.json({ message: "Failed to get AI response" }, { status: 500 });
  }

  // 7. Determine Next Agent
  let nextAgent = currentAgent;

  if (currentAgent === 'nurse') {
    console.log("Current agent is Nurse. Checking for suggestion...");
    const suggestionMatch = geminiResponse.text.match(/Suggest:\s*(.+)/);
    if (suggestionMatch) {
      const suggestedSpecialists = suggestionMatch[1].split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'));
      console.log("Nurse suggested specialists:", suggestedSpecialists);
      for (let suggestedSpecialist of suggestedSpecialists) {
          if (Object.keys(agents).includes(suggestedSpecialist)) {
              nextAgent = 'interpreter';
              console.log("Switching to Interpreter.");
              break; // Use the *first* valid suggestion
          }
      }
    } else {
      nextAgent = 'interpreter';
      console.log("Nurse did not suggest a specialist. Switching to Interpreter.");
    }
  } else if (currentAgent === "interpreter") {
     console.log("Current agent is Interpreter. Checking formatted data...");
    if (geminiResponse.formattedData && geminiResponse.formattedData.suggestedSpecialist) {
      let suggested = geminiResponse.formattedData.suggestedSpecialist.toLowerCase().replace(/\s+/g, '_');
       console.log("Interpreter suggested specialist:", suggested);
      if (Object.keys(agents).includes(suggested)) {
        nextAgent = suggested;
         console.log("Switching to specialist:", nextAgent);
      } else {
        nextAgent = "general_practitioner";
        console.log("Invalid specialist suggestion. Switching to General Practitioner.");
      }
    } else {
      nextAgent = "general_practitioner";
      console.log("Interpreter did not suggest a specialist. Switching to General Practitioner.");
    }
  } else {
    console.log(`Current agent is ${currentAgent}.  Keeping the same agent.`);
  }
 console.log("Next Agent:", nextAgent);

  // 8. Update current_agent in chat_sessions
  const { error: updateChatError } = await supabase
    .from('chat_sessions')
    .update({ current_agent: nextAgent })
    .eq('id', chatSession.id);

  if (updateChatError) {
    console.error('Failed to store current agent:', updateChatError);
  }

  return NextResponse.json({ success: true, nextAgent }, { status: 200 });
}