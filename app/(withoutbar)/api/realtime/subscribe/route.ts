// app/api/realtime/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseAdmin(request);

  // Create a TransformStream.  We'll pipe the updates through this.
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Set up the Supabase Realtime subscription
  const channel = supabase
    .channel("passenger-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "passengers" },
      (payload) => {
        // Convert the payload to a string (SSE requires string data)
        const data = JSON.stringify(payload);
        // Encode the string as a Uint8Array (required by streams)
        const encodedData = new TextEncoder().encode(`data: ${data}\n\n`);
        // Write the data to the stream
        writer.write(encodedData);
      }
    )
    .subscribe();

  // Function to clean up the subscription when the client disconnects
  const cleanup = () => {
    console.log("Client disconnected, unsubscribing from Supabase Realtime");
    channel.unsubscribe();
    writer.close(); // Close the writer
  };

  // Handle client disconnects
  request.signal.onabort = cleanup;


    return new NextResponse(stream.readable, {
        headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        },
    });
}
export const dynamic = 'force-dynamic';