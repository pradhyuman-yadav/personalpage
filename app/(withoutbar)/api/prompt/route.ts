// app/api/prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseClient';
import { generateLawResponse } from '@/lib/gemini'; // Import Gemini function
import { v4 as uuidv4 } from 'uuid';

const supabase = createSupabaseAdmin();

export async function POST(request: NextRequest) {
    try {
        const { promptId, newPrompt, userQuestion } = await request.json();

        // --- Get User's Location from IP ---
        let userLocation = "Unknown Location"; // Default value
        console.log("Request Headers:", request.headers);
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '::1';
        console.log("IP", ip);

        // Use a try-catch block for the geolocation API call
        try {
            // Use ipapi.co (you can replace this with ipinfo.io or another service)
          const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            userLocation = geoData.country_name || "Unknown Location"; // Get country name
          } else {
            console.error("Geolocation API error:", geoResponse.status);
          }
        } catch (geoError) {
          console.error("Error fetching geolocation data:", geoError);
        }

        if (newPrompt) {
            // --- Create a new prompt ---
            const newPromptId = uuidv4();
            const { error: insertError } = await supabase
                .from('law_chat_history')
                .insert([{ prompt_id: newPromptId, history: [] }]); // Initialize with an empty history

            if (insertError) {
                console.error("Supabase insert error:", insertError);
                return NextResponse.json({ error: "Failed to initialize chat history" }, { status: 500 });
            }
            return NextResponse.json({ promptId: newPromptId }, { status: 201 });
        }

        // --- Existing Prompt Logic ---
        if (!promptId) {
            return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
        }

        // Check for userQuestion *only* if it's not a new prompt.
        if (!userQuestion) {
            return NextResponse.json({ error: "User question is required" }, { status: 400 });
        }

        // Fetch existing history
        const { data: historyData, error: fetchError } = await supabase
            .from('law_chat_history')
            .select('history')
            .eq('prompt_id', promptId)
            .single();  // Use single() since prompt_id is unique

        if (fetchError) {
            console.error("Supabase fetch error:", fetchError);
            return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
        }

        const existingHistory = historyData?.history || [];
        const historyString = existingHistory.join("\n"); // Join history into a single string

        // Call Gemini
        const geminiResponse = await generateLawResponse(historyString, userQuestion, userLocation);


        // Update history in Supabase
        const newHistory = [
            `User: ${userQuestion}`,
            `Assistant: ${geminiResponse}`,
            ...existingHistory, // Prepend new turns to the existing history
        ];

        const { error: updateError } = await supabase
            .from('law_chat_history')
            .update({ history: newHistory })
            .eq('prompt_id', promptId);

        if (updateError) {
            console.error("Supabase update error:", updateError);
            return NextResponse.json({ error: "Failed to update chat history" }, { status: 500 });
        }

        return NextResponse.json({ result: geminiResponse, promptId: promptId, history: newHistory }, {status: 200});

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}