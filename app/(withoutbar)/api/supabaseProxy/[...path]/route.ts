// app/api/supabaseProxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const awaitedContext = { params: await context.params };
  return handleRequest(request, awaitedContext);
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const awaitedContext = { params: await context.params };
  return handleRequest(request, awaitedContext);
}
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const awaitedContext = { params: await context.params };
  return handleRequest(request, awaitedContext);
}
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const awaitedContext = { params: await context.params };
  return handleRequest(request, awaitedContext);
}
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const awaitedContext = { params: await context.params };
  return handleRequest(request, awaitedContext);
}

async function handleRequest(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const { path } = context.params; // Correct: Access params directly (NO await)
  const pathString = path.join("/");
  try {
    const supabase = createSupabaseAdmin(request); // Create client *inside*
    let supabaseMethod: any = supabase;
    const parts = pathString.split("/");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof supabaseMethod[part] === "function") {
        // If current part is a function and there is next part, check it for argument or function.
        if (i < parts.length - 1) {
          const nextPart = parts[i + 1];
          //Check whether the next part is argument for current function.
          if (typeof supabaseMethod[part][nextPart] !== "function") {
            supabaseMethod = supabaseMethod[part](nextPart);
            i++; // Skip next part, because that is already taken as argument.
          } else {
            supabaseMethod = supabaseMethod[part];
          }
        }
        //If there is no more part left, that means it is last function.
        else {
          if (request.method !== "GET") {
            const reqBody = await request.json();
            supabaseMethod = await supabaseMethod[part](reqBody);
          } else {
            supabaseMethod = await supabaseMethod[part]();
          }
        }
      } else {
        supabaseMethod = supabaseMethod(part);
      }
    }

    if (supabaseMethod.error) {
      console.error("Supabase error:", supabaseMethod.error);
      return new NextResponse(
        JSON.stringify({ error: supabaseMethod.error.message }),
        {
          status: supabaseMethod.error.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new NextResponse(JSON.stringify(supabaseMethod.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
