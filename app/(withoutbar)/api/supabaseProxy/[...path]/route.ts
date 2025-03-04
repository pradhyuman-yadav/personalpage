/* eslint-disable */
// app/api/supabaseProxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Helper functions to build the query, now with correct return types
function from(supabase: SupabaseClient<Database>, table: string): any {
  return supabase.from(table);
}

async function select(
  queryBuilder: any,
  columns: string
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.select(columns); // Await here
}

// Add more helper functions as needed (insert, update, delete, etc.)
async function insert(
  queryBuilder: any,
  body: any
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.insert(body).select();
}

async function update(
  queryBuilder: any,
  body: any,
  id: any
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.update(body).eq("id", id).select();
}

async function deleteData(
  queryBuilder: any,
  id: any
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.delete().eq("id", id);
}

async function order(
  queryBuilder: any,
  column: string,
  ascending: boolean = true
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.order(column, { ascending });
}

async function limit(
  queryBuilder: any,
  count: number
): Promise<{ data: any; error: PostgrestError | null }> {
  return await queryBuilder.limit(count);
}

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
  const { path } = context.params;
  const pathString = path.join("/");

  try {
    const supabase = createSupabaseAdmin();

    // Handle specific endpoints
    if (pathString === "passengers/initial-passengers") {
      const { data, error } = await supabase.from("passengers").select("*");
      if (error) {
        return handleError(error);
      }
      return NextResponse.json(data || []);
    }

    const parts = pathString.split("/");
    const tableName = parts[0];

    if (!tableName) {
      return NextResponse.json(
        { error: "No table specified" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder: any = from(supabase, tableName);
    let result: { data: any; error: PostgrestError | null } = {
      data: null,
      error: null,
    };

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      if (i < parts.length - 1) {
        const nextPart = parts[i + 1];
        switch (part) {
          case "select":
            result = await select(queryBuilder, nextPart); // Await and store result
            if (result.error) return handleError(result.error);
            queryBuilder = result; // Update for chaining
            i++; // Skip the next part (columns)
            break;
          case "order":
            const orderColumn = nextPart;
            const orderDirection = parts[i + 2];
            const ascending = orderDirection === "asc";
            result = await order(queryBuilder, orderColumn, ascending);
            if (result.error) return handleError(result.error);
            queryBuilder = result; // Update for chaining

            i += 2; // Skip *two* parts (column and direction)
            break;
          case "limit":
            result = await limit(queryBuilder, parseInt(nextPart, 10));
            if (result.error) return handleError(result.error);
            queryBuilder = result; // Update for chaining

            i++;
            break;
          // Add more cases for other methods (filter, etc.)
          default:
            return NextResponse.json(
              { error: `Invalid method: ${part}` },
              { status: 400 }
            );
        }
      } else {
        // Final part (usually the query execution)
        const reqBody = await request.json();
        switch (request.method) {
          case "GET":
            result = await queryBuilder; // Await the final query
            break;
          case "POST":
            result = await insert(queryBuilder, reqBody); // Use helper
            break;
          case "PUT":
            result = await update(queryBuilder, reqBody, reqBody.id); // Use helper and pass id.
            break;
          case "DELETE":
            result = await deleteData(queryBuilder, reqBody.id); // Use helper
            break;
          case "PATCH":
            result = await update(queryBuilder, reqBody, reqBody.id); // Use helper and pass id
            break;
          default:
            return NextResponse.json(
              { error: "Unsupported method" },
              { status: 405 }
            );
        }
      }
    }

    if (result.error) {
      return handleError(result.error);
    }

    return NextResponse.json(result.data || [], { status: 200 });
  } catch (error: unknown) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  console.error("Error:", error);
  let errorMessage = "Internal Server Error";
  let statusCode = 500;
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  if (error && typeof error === "object" && "status" in error) {
    statusCode = (error as { status: number }).status; // Type assertion
  }

  return NextResponse.json({ message: errorMessage }, { status: statusCode });
}
