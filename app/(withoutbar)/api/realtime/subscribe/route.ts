import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { Readable } from 'stream';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';


export async function GET(request: NextRequest) {
    const supabase = createSupabaseAdmin();

    // Create a stream for Server-Sent Events
    const stream = new Readable({
        read() {}, // Don't need to implement read
    });

    // Set up the Supabase Realtime subscription
    const channel = supabase
        .channel('passenger-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'passengers' },
            (payload) => {
              // Convert the payload to a string (SSE requires string data)
              const data = JSON.stringify(payload);
              // Push the data to the stream
              stream.push(`data: ${data}\n\n`);  // SSE format: "data: ...\n\n"
            }
        )
    .subscribe();


    // Function to clean up the subscription when the client disconnects
    const cleanup = () => {
        console.log("Client disconnected, unsubscribing from Supabase Realtime");
        channel.unsubscribe();
        stream.push(null); // Signal the end of the stream
    };

  // Important: Handle client disconnects
    request.signal.addEventListener('abort', cleanup);



  const readableStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(chunk));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    }
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

//Tell next js to not cache this route.
export const dynamic = 'force-dynamic';