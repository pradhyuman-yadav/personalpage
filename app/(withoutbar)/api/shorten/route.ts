// /api/shorten/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    console.log(supabaseUrl, supabaseServiceRoleKey);

    const body = await request.json();
    const { url, expirationHours } = body; // Get expirationHours

    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
    }

    // Validate expirationHours (you can add more sophisticated validation here)
    if (
      typeof expirationHours !== "number" ||
      expirationHours <= 0 ||
      expirationHours > 72
    ) {
      return NextResponse.json(
        { message: "Invalid expiration time" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch (err) {
      console.error("Invalid URL format:", err);
      return NextResponse.json(
        { message: "Invalid URL format" },
        { status: 400 }
      );
    }

    const slug = Math.random().toString(36).substring(2, 8);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Calculate deleted_at based on expirationHours
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);

    const { error } = await supabase
      .from("urls")
      .insert([
        {
          short_id: slug,
          original_url: url,
          deleted_at: expiration.toISOString(), // Use calculated expiration
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting URL:", error);
      return NextResponse.json(
        { message: "Error creating short URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal Server Error in NEXTJS" },
      { status: 500 }
    );
  }
}