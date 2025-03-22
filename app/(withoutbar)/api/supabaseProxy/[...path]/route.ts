// app/api/supabaseProxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";

// Route Handlers (using async/await for clarity)
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

// Main Request Handler
async function handleRequest(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const { path } = context.params;
  const pathString = path.join("/");

  try {
    const supabase = createSupabaseAdmin();

    // --- Handle Specific Endpoints (BEFORE generic logic) ---
    if (
      pathString === "passengers/initial-passengers" &&
      request.method === "GET"
    ) {
      const { data, error } = await supabase.from("passengers").select("*");
      if (error) {
        return handleError(error);
      }
      return NextResponse.json(data || []); // Return empty array if null
    }

    if (pathString.startsWith("messages/chat/") && request.method === "GET") {
      // Get messages for a specific chat session
      const chatId = pathString.split("/")[2]; // Extract chat ID
      if (!chatId) {
        return NextResponse.json(
          { error: "ChatId is required" },
          { status: 400 }
        );
      }

      const { data: chatSession, error: chatSessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("chat_id", chatId)
        .single();

      if (chatSessionError || !chatSession) {
        return NextResponse.json({ error: "Invalid chat ID" }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_session_id", chatSession.id)
        .order("sent_at", { ascending: true });

      if (error) {
        return handleError(error);
      }
      return NextResponse.json(data || [], { status: 200 });
    }

    // --- Generic Proxy Logic (for all other requests) ---
    const parts = pathString.split("/");
    const tableName = parts[0];

    if (!tableName) {
      return NextResponse.json(
        { error: "No table specified" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder: any = supabase.from(tableName);

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (i < parts.length - 1) {
        const nextPart = parts[i + 1];
        switch (part) {
          case "select":
            queryBuilder = queryBuilder.select(nextPart);
            i++;
            break;
          case "order":
            const orderColumn = nextPart;
            const orderDirection = parts[i + 2] || "asc";
            const ascending = orderDirection === "asc";
            queryBuilder = queryBuilder.order(orderColumn, { ascending });
            i += 2;
            break;
          case "limit":
            queryBuilder = queryBuilder.limit(parseInt(nextPart, 10));
            i++;
            break;
          case "where":
            const whereColumn = nextPart;
            const operator = parts[i + 2];
            let whereValue: string | number | boolean | string[] = parts[i + 3];
            if (
              operator === "eq" ||
              operator === "neq" ||
              operator === "gt" ||
              operator === "lt" ||
              operator === "gte" ||
              operator === "lte"
            ) {
              if (!isNaN(Number(whereValue))) {
                whereValue = Number(whereValue);
              } else if (
                whereValue.toLowerCase() === "true" ||
                whereValue.toLowerCase() === "false"
              ) {
                whereValue = whereValue.toLowerCase() === "true";
              }
            } else if (operator === "in") {
              whereValue = whereValue.split(",");
            }
            queryBuilder = queryBuilder.filter(
              whereColumn,
              operator,
              whereValue
            );
            i += 3;
            break;
          default:
          //return NextResponse.json({ error: `Invalid method: ${part}` }, { status: 400 });
          //Don't return and just skip.
        }
      } else {
        let reqBody = null;
        try {
          if (
            request.body &&
            request.headers.get("content-type") === "application/json"
          ) {
            reqBody = await request.json();
          }
        } catch (error: unknown) {
          return NextResponse.json({ error: String(error) }, { status: 400 });
        }
        switch (request.method) {
          case "GET":
            // queryBuilder is already set up
            break;
          case "POST":
            queryBuilder = queryBuilder.insert(reqBody).select();
            break;
          case "PUT":
          case "PATCH":
            if (!reqBody || !reqBody.id) {
              return NextResponse.json(
                { error: "Missing ID for update" },
                { status: 400 }
              );
            }
            queryBuilder = queryBuilder
              .update(reqBody)
              .eq("id", reqBody.id)
              .select();
            break;
          case "DELETE":
            if (!reqBody || !reqBody.id) {
              return NextResponse.json(
                { error: "Missing ID for delete" },
                { status: 400 }
              );
            }
            queryBuilder = queryBuilder.delete().eq("id", reqBody.id).select();
            break;
          default:
            return NextResponse.json(
              { error: "Unsupported method" },
              { status: 405 }
            );
        }
      }
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return handleError(error);
    }

    // Correctly handle 204 and empty arrays
    if (request.method === "DELETE") {
      return new NextResponse(null, { status: 204 });
    } else if (data === null || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json([], { status: 200 });
    }

    // Serialize dates
    let serializedData: string;
    try {
      serializedData = JSON.stringify(data, (key, value) => {
        if (typeof value === "string") {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString(); // Convert to ISO string
          }
        }
        return value;
      });
    } catch (serializeError) {
      console.error("Serialization error:", serializeError);
      return NextResponse.json(
        { message: "Serialization Error" },
        { status: 500 }
      );
    }

    if (serializedData) {
      return NextResponse.json(JSON.parse(serializedData), { status: 200 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return handleError(error);
  }
}

// Centralized Error Handling
function handleError(error: unknown) {
  console.error("Error:", error);
  let errorMessage = "Internal Server Error";
  let statusCode = 500;

  if (error instanceof Error) {
    errorMessage = error.message;
  }
  if (error && typeof error === "object" && "status" in error) {
    statusCode = (error as { status: number }).status;
  }
  return NextResponse.json({ message: errorMessage }, { status: statusCode });
}
