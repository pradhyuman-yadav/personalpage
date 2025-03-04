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
  const { path } = context.params;
  const pathString = path.join("/");
  let response: NextResponse | undefined;

  try {
    const supabase = createSupabaseAdmin(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabaseMethod: any = supabase; // Start with the Supabase client

    const parts = pathString.split("/");

    if (pathString === "passengers/initial-passengers") {
      const { data, error } = await supabase.from("passengers").select("*");
      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch initial passengers", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(data || []); // Return the data directly
    }

    // You MUST start with .from()
    if (parts.length > 0) {
        supabaseMethod = supabase.from(parts[0]); // Call .from() with the first part
    }

    // Iterate through the remaining parts
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
        if (i < parts.length - 1) {
            const nextPart = parts[i+1];
            if(typeof supabaseMethod[part] === 'function' && typeof supabaseMethod[part][nextPart] !== 'function' ){
                supabaseMethod = supabaseMethod[part](nextPart);
                i++;
            }
            else if(typeof supabaseMethod[part] === 'function'){
                supabaseMethod = supabaseMethod[part]();
            }
            else{
                supabaseMethod = supabaseMethod[part];
            }
        }
        else {
            if (request.method !== 'GET') {
                const reqBody = await request.json();
                supabaseMethod = await supabaseMethod[part](reqBody);
            }
            else{
                supabaseMethod = await supabaseMethod[part]();

            }

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
    if(supabaseMethod instanceof NextResponse){
        response = supabaseMethod
        console.log("Response is NextResponse", response)
    }
    return new NextResponse(JSON.stringify(supabaseMethod.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(
      JSON.stringify({ message: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// async function handleInitialPassengers(request: NextRequest) {
//   try {
//       const supabase = createSupabaseAdmin(request);
//       const { data, error } = await supabase.from('passengers').select('*');

//       if (error) {
//           console.error("Supabase error:", error);
//           return NextResponse.json(
//               { error: "Failed to fetch initial passengers", details: error.message },
//               { status: 500 }
//           );
//       }

//       return NextResponse.json(data); // Return the data directly

//   } catch (error: any) {
//       console.error("Error fetching initial passengers:", error);
//        let errorMessage = "Internal Server Error";
//       if(error instanceof Error){
//           errorMessage = error.message;
//       }
//       return new NextResponse(
//       JSON.stringify({ message: errorMessage }),
//       {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//       }
//       );
//   }
// }