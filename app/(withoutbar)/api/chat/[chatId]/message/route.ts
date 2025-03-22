// // app/api/chat/[chatId]/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { callGemini } from "@/lib/gemini";
import { agents } from "@/lib/agents";

// export async function POST(
//   request: NextRequest,
//   context: { params: Promise<{ chatId: string }> }
// ) {
//   const { chatId } = (await context.params);
//   const supabase = createSupabaseAdmin();
//   const reqBody = await request.json();
//   const { message }: { message: string } = reqBody;

//   console.log('Received message:', message);

//   if (!message) {
//     return NextResponse.json({ error: "Message is required" }, { status: 400 });
//   }

//   // 1. Get Chat Session (to link message)
//   const { data: chatSession, error: chatSessionError } = await supabase
//     .from("chat_sessions")
//     .select("*")
//     .eq("chat_id", chatId).single();

//   if (chatSessionError || !chatSession) {
//     return NextResponse.json({ error: "Invalid chat ID" }, { status: 404 });
//   }
//     // Get current Agent.
//     const { data: currentAgentData, error: currentAgentError } = await supabase
//     .from("chat_sessions")
//     .select("current_agent")
//     .eq("chat_id", chatId).single();

//     if(currentAgentError){
//         return NextResponse.json({ error: "Failed to fetch current agent" }, { status: 500 });
//     }

//     let currentAgent = currentAgentData?.current_agent || 'nurse'; // Default to nurse.

//   // 2. Insert User Message into Supabase
//   const { data: userMessage, error: userMessageError } = await supabase
//     .from("messages")
//     .insert([
//       {
//         chat_session_id: chatSession.id,
//         sender_type: "user",
//         sender_name: chatSession.user_id, // Or get the user's name
//         message_text: message,
//       },
//     ]).select().single();

//   if (userMessageError) {
//     console.error("Error inserting user message:", userMessageError);
//     return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
//   }
//   // 3.  Fetch Chat History
//   const { data: chatHistory, error: historyError } = await supabase
//     .from('messages')
//     .select('*')
//     .eq('chat_session_id', chatSession.id)
//     .order('sent_at', { ascending: true });

//     if (historyError) {
//         console.error('Error fetching chat history:', historyError);
//         return NextResponse.json({ message: 'Failed to fetch chat history' }, { status: 500 });
//     }

//   // 4. Determine Next Agent and Call Gemini
//   const geminiResponse = await callGemini(currentAgent, chatHistory);

// // 5. Insert Gemini Response into Supabase
//   const { error: geminiMessageError } = await supabase
//   .from("messages")
//   .insert([
//     {
//       chat_session_id: chatSession.id,
//       sender_type: currentAgent, // Use current agent type
//       sender_name: currentAgent,
//       message_text: geminiResponse.text,
//       formatted_data: geminiResponse.formattedData,
//     },
//   ]).select().single();

// if (geminiMessageError) {
//   console.error("Error inserting Gemini response:", geminiMessageError);
//   return NextResponse.json(
//     { message: "Failed to get AI response" },
//     { status: 500 }
//   );
// }

// // 6.  Process Gemini Response and Determine Next Agent
// let nextAgent = currentAgent; // Default: keep the same agent

// if (currentAgent === 'nurse') {
//     const suggestionMatch = geminiResponse.text.match(/Suggest:\s*(.+)/);
//     if (suggestionMatch) {
//         const suggestedSpecialists = suggestionMatch[1].split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'));
//          // Find first suggestion
//         for(let suggestedSpecialist of suggestedSpecialists){
//             if (Object.keys(agents).includes(suggestedSpecialist)) { // IMPORTANT: Check if valid
//                 nextAgent = 'interpreter'; // Go to the Interpreter next
//                 break;
//             }
//         }
//     } else {
//         nextAgent = 'interpreter'; // If nurse has no clear suggestion
//     }
// } else if (currentAgent === "interpreter") {
//     if (geminiResponse.formattedData && geminiResponse.formattedData.suggestedSpecialist) {
//       let suggested = geminiResponse.formattedData.suggestedSpecialist.toLowerCase().replace(/\s+/g, '_');
//         if (Object.keys(agents).includes(suggested)) { // CRUCIAL: Validate the specialist
//             nextAgent = suggested;
//         } else {
//             nextAgent = "general_practitioner"; // Default fallback
//         }
//     } else {
//         nextAgent = "general_practitioner"; // Default fallback
//     }
// }
// // 7. Store current agent
// const { error: updateChatError } = await supabase
//     .from('chat_sessions')
//     .update({ current_agent: nextAgent })
//     .eq('id', chatSession.id);
// if(updateChatError){
//     console.error('Failed to store current agent:', updateChatError);
// }
//   return NextResponse.json({ success: true, nextAgent }, { status: 200 }); // Return nextAgent
// }

// app/api/chat/[chatId]/message/route.ts

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await context.params;
  const supabase = createSupabaseAdmin();
  const reqBody = await request.json();
  const { message }: { message: string } = reqBody;
  console.log("Received message:", message);

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 1. Get Chat Session (to link message)
  const { data: chatSession, error: chatSessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (chatSessionError || !chatSession) {
    return NextResponse.json({ error: "Invalid chat ID" }, { status: 404 });
  }
  // Get current Agent.
  const { data: currentAgentData, error: currentAgentError } = await supabase
    .from("chat_sessions")
    .select("current_agent")
    .eq("chat_id", chatId)
    .single();

  if (currentAgentError) {
    return NextResponse.json(
      { error: "Failed to fetch current agent" },
      { status: 500 }
    );
  }

  let currentAgent = currentAgentData?.current_agent || "nurse";

  // 2. Insert User Message into Supabase
  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert([
      {
        chat_session_id: chatSession.id,
        sender_type: "user",
        sender_name: chatSession.user_id, // Or get the user's name
        message_text: message,
      },
    ])
    .select()
    .single();

  if (userMessageError) {
    console.error("Error inserting user message:", userMessageError);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }

  // 3.  Fetch Chat History
  const { data: chatHistory, error: historyError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_session_id", chatSession.id)
    .order("sent_at", { ascending: true });

  if (historyError) {
    console.error("Error fetching chat history:", historyError);
    return NextResponse.json(
      { message: "Failed to fetch chat history" },
      { status: 500 }
    );
  }

  // 4. Determine Next Agent and Call Gemini
//   const geminiResponse = await callGemini(currentAgent, chatHistory);

  return NextResponse.json({ message: "Route handler reached!" });
}
