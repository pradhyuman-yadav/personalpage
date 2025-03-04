// app/api/pastes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const supabaseServer = await createSupabaseAdmin(); // Import server client

  try {
    const { content, title, slug, expiration, syntax_highlighting } =
      await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    let generatedSlug = slug;
    if (!generatedSlug) {
      // Generate a unique slug (consider a library like short-uuid for better uniqueness)
      generatedSlug = Math.random().toString(36).substring(2, 8);
    }

    let expiresAt = null;
    if (expiration !== "never") {
      const now = new Date();
      let timeToAdd;
      switch (expiration) {
        case "10m":
          timeToAdd = 10 * 60 * 1000;
          break;
        case "1h":
          timeToAdd = 60 * 60 * 1000;
          break;
        case "1d":
          timeToAdd = 24 * 60 * 60 * 1000;
          break;
        case "1w":
          timeToAdd = 7 * 24 * 60 * 60 * 1000;
          break;
        case "1mo":
          timeToAdd = 30 * 24 * 60 * 60 * 1000; // Approximation
          break;
        default:
          expiresAt = null;
      }
      if (timeToAdd) {
        expiresAt = new Date(now.getTime() + timeToAdd).toISOString();
      }
    }
    const { error: insertError } = await supabaseServer
      .from("pastes")
      .insert([
        {
          content,
          title: title || null,
          short_id: generatedSlug,
          expires_at: expiresAt,
          syntax_highlighting,
        },
      ])
      .select();

    if (insertError) {
      if (
        insertError.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        ); // 409 Conflict
      } else {
        return NextResponse.json(
          { error: `Error creating paste: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, slug: generatedSlug },
      { status: 201 }
    ); // 201 Created
  } catch (error) {
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error}` },
      { status: 500 }
    );
  }
}
