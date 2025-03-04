// app/api/supabaseProxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
// import { SupabaseClient } from "@supabase/supabase-js";
// import { Database } from "@/types/supabase";

// Helper functions to build the query, now with correct return types
// function from(supabase: SupabaseClient<Database>, table: string) {
//     return supabase.from(table);
// }

// async function select(queryBuilder: any, columns: string) {
//     return await queryBuilder.select(columns); // Await here
// }

// async function insert(queryBuilder: any, body: any) {
//     return await queryBuilder.insert(body).select();
// }

// async function update(queryBuilder: any, body: any, id:any) { //add the id.
//     return await queryBuilder.update(body).eq('id', id).select();
// }

// async function deleteData(queryBuilder: any, id:any){
//     return await queryBuilder.delete().eq('id',id);
// }
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
    let queryBuilder: any = supabase.from(tableName);

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      if (i < parts.length - 1) {
        const nextPart = parts[i + 1];
        switch (part) {
          case "select":
            queryBuilder = queryBuilder.select(nextPart); // Call select
            i++; // Skip the next part (columns)
            break;
          case "order":
            const orderColumn = nextPart;
            const orderDirection = parts[i + 2];
            const ascending = orderDirection === "asc";
            queryBuilder = queryBuilder.order(orderColumn, { ascending });
            i += 2; // Skip *two* parts (column and direction)
            break;
          case "limit":
            queryBuilder = queryBuilder.limit(parseInt(nextPart, 10));
            i++;
            break;
          // Add more cases for other methods (filter, etc.)
          default:
            //No method found, invalid request.
            return NextResponse.json(
              { error: `Invalid method: ${part}` },
              { status: 400 }
            );
        }
      } else {
        // Final part (usually the query execution)
        switch (request.method) {
          case "GET":
            queryBuilder = await queryBuilder; // Await the final query
            break;
          case "POST":
            const reqBody = await request.json();
            queryBuilder = await queryBuilder.insert(reqBody).select(); // Use helper
            break;
          case "PUT":
            const putBody = await request.json();
            queryBuilder = await queryBuilder
              .update(putBody)
              .eq("id", putBody.id)
              .select(); // Use helper
            break;
          case "DELETE":
            const deleteBody = await request.json();
            queryBuilder = await queryBuilder.delete().eq("id", deleteBody.id); // Use helper
            break;
          case "PATCH":
            const patchBody = await request.json();
            queryBuilder = await queryBuilder
              .update(patchBody)
              .eq("id", patchBody.id)
              .select(); // Use helper

            break;
          default:
            return NextResponse.json(
              { error: "Unsupported method" },
              { status: 405 }
            );
        }
      }
    }
    if (queryBuilder.error) {
      return handleError(queryBuilder.error);
    }

    return NextResponse.json(queryBuilder.data || [], { status: 200 });
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
    statusCode = (error as { status: number }).status;
  }

  return NextResponse.json({ message: errorMessage }, { status: statusCode });
}
