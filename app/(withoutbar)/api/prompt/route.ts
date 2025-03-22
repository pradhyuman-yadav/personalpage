// app/api/prompt/route.ts
import { NextResponse } from "next/server";
import { runPrompt, createPrompt, PromptGuardOption } from "@/lib/jigsawstack"; // No getPrompt
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const { promptId, newPrompt, userQuestion } = await request.json();

    if (newPrompt) {
      // --- Create a new prompt ---
      const createResult = await createPrompt({
        prompt:
          "You are a helpful Law assistant. Here is the conversation history so far:\n\n{history}\n\nUser: {question}\nAssistant:",
        inputs: [
          { key: "question", optional: false },
          { key: "history", optional: true, initial_value: "" },
        ],
        return_prompt:
          "Return the result in a markdown format with maximum 200 words",
        prompt_guard: [
          "sexual_content",
          "defamation",
          "hate",
          "privacy",
          "elections",
        ] as PromptGuardOption[],
      });

      const newPromptId = createResult.prompt_engine_id;

      // --- Insert into Supabase ---
      const { error: insertError } = await supabase
        .from("law_chat_history")
        .insert([{ prompt_id: newPromptId, history: [] }]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to initialize chat history" },
          { status: 500 }
        );
      }

      return NextResponse.json({ promptId: newPromptId }, { status: 201 });
    }

    // --- Existing Prompt Logic ---
    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    // --- Fetch History ---
    const { data: historyData, error: fetchError } = await supabase
      .from("law_chat_history")
      .select("history")
      .eq("prompt_id", promptId)
      .single();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    const existingHistory = historyData?.history || [];
    const historyString =
      existingHistory.length > 0 ? existingHistory.join("\n") : "";

    console.log("Type of userQuestion", typeof userQuestion);
    console.log("Type of historyString", typeof historyString);

    const combinedInputValues = {
      question: userQuestion as string,
      history: "History: "+historyString.slice(0, 250) as string,
    };
    if (historyString) {
      combinedInputValues.history = historyString;
    }
    
    // --- Run the prompt ---
    console.log("Running prompt with ID:", promptId);
    console.log("Combined Input Values:", combinedInputValues);

    const result = await runPrompt({
      id: promptId,
      input_values: combinedInputValues,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to run prompt" },
        { status: 500 }
      );
    }

    // --- Update History ---
    const newHistory = [
      `User: ${userQuestion}`,
      `Assistant: ${result.result}`,
      ...existingHistory,
    ];

    const { error: updateError } = await supabase
      .from("law_chat_history")
      .update({ history: newHistory })
      .eq("prompt_id", promptId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update chat history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: result.result, history: newHistory });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred" },
      { status: 500 }
    );
  }
}
