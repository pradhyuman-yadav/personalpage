// app/api/chat/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { generateChatId } from "@/lib/utils"; // Helper function for chat ID

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();
  const reqBody = await request.json();
  const {
    name,
    age,
    other_info,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { name: string; age: number; other_info: any } = reqBody;

  if (!name || !age) {
    return NextResponse.json(
      { error: "Name and age are required" },
      { status: 400 }
    );
  }

  // 1. Create User
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([{ name, age, other_info }])
    .select()
    .single();

  if (userError) {
    console.error("User creation error:", userError);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }

  // 2. Create Chat Session
  const chatId = generateChatId(); // Implement this function (see below)
  const { data: chatSessionData, error: chatSessionError } = await supabase
    .from("chat_sessions")
    .insert([{ user_id: userData.id, chat_id: chatId, current_agent: "nurse" }])
    .select()
    .single(); // Initialize current_agent

  if (chatSessionError) {
    console.error("Chat session creation error:", chatSessionError);
    return NextResponse.json(
      { message: "Failed to create chat session" },
      { status: 500 }
    );
  }
  // 3. Send Initial message from Nurse.
  const { error: initialMessageError } = await supabase
    .from("messages")
    .insert([
      {
        chat_session_id: chatSessionData.id,
        sender_type: "nurse",
        sender_name: "Nurse",
        message_text: `Hi ${name}, I'm the nurse.  Tell me about your symptoms.`,
      },
    ])
    .select()
    .single();

  if (initialMessageError) {
    console.error("Error sending initial message:", initialMessageError);
    return NextResponse.json(
      { message: "Failed to send initial message" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { chatId: chatSessionData.chat_id, userId: userData.id },
    { status: 201 }
  );
}
