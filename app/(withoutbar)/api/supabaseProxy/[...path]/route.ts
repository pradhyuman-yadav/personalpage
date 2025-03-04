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

// async function handleRequest(
//   request: NextRequest,
//   context: { params: { path: string[] } }
// ) {
//   const { path } = context.params;
//   const pathString = path.join("/");
//     let response: NextResponse | undefined;

//   try {
//     const supabase = createSupabaseAdmin(); // Simplified: No request needed

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     let supabaseMethod: any = supabase;

//     const parts = pathString.split("/");
//         // Handle initial-passengers specifically
//         if (pathString === "passengers/initial-passengers") {
//             const { data, error } = await supabase.from("passengers").select("*");
//             if (error) {
//                 console.error("Supabase error:", error);
//                 return NextResponse.json(
//                 { error: "Failed to fetch initial passengers", details: error.message },
//                 { status: 500 }
//                 );
//             }
//             return NextResponse.json(data || []); // Return the data directly
//         }

//         if (pathString === "stations/select/id,name") {
//           const {data, error} = await supabase.from('stations').select('id,name');
//           if (error) {
//             console.error("Supabase error:", error);
//             return NextResponse.json(
//               { error: "Failed to fetch stations", details: error.message },
//               { status: 500 }
//             );
//           }
//             return NextResponse.json(data || []);
//       }

//     if (parts.length > 0) {
//         supabaseMethod = supabase.from(parts[0]);
//     }

//     for (let i = 1; i < parts.length; i++) {
//       const part = parts[i];
//         if (i < parts.length - 1) {
//             const nextPart = parts[i+1];
//             if(typeof supabaseMethod[part] === 'function' && typeof supabaseMethod[part][nextPart] !== 'function' ){
//                 supabaseMethod = supabaseMethod[part](nextPart);
//                 i++;
//             }
//             else if(typeof supabaseMethod[part] === 'function'){
//                 supabaseMethod = supabaseMethod[part]();
//             }
//             else{
//                 supabaseMethod = supabaseMethod[part];
//             }
//         }
//         else {
//             if (request.method !== 'GET') {
//                 const reqBody = await request.json();
//                 supabaseMethod = await supabaseMethod[part](reqBody);
//             }
//             else{
//                 supabaseMethod = await supabaseMethod[part]();

//             }

//         }
//     }

//     if (supabaseMethod.error) {
//       console.error("Supabase error:", supabaseMethod.error);
//         return new NextResponse(
//             JSON.stringify({ error: supabaseMethod.error.message }),
//             {
//             status: supabaseMethod.error.status || 500,
//             headers: { "Content-Type": "application/json" },
//             }
//         );
//     }
//       // Set response if there is a NextResponse
//     if(supabaseMethod instanceof NextResponse){
//         response = supabaseMethod
//     }
//     console.log("Response is NextResponse", response)
//     return new NextResponse(JSON.stringify(supabaseMethod.data), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error: unknown) {
//         console.error("Proxy error:", error);
//         let errorMessage = "Internal Server Error";
//         if(error instanceof Error){
//             errorMessage = error.message;
//         }
//         return new NextResponse(
//         JSON.stringify({ message: errorMessage }),
//         {
//             status: 500,
//             headers: { "Content-Type": "application/json" },
//         }
//         );
//     }
// }

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
        console.error("Supabase error:", error);
        return NextResponse.json(
          {
            error: "Failed to fetch initial passengers",
            details: error.message,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(data || []); // Return the data directly
    }
    if (pathString === "stations/select/id,name") {
      const { data, error } = await supabase.from("stations").select("id,name");
      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch stations", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(data || []);
    }

    // General case (using the path as the table name) -- BE CAREFUL WITH THIS
    const [tableName, ...restOfPath] = path;

    if (!tableName) {
      return NextResponse.json(
        { error: "No table specified" },
        { status: 400 }
      );
    }

    let queryBuilder = supabase.from(tableName); // Initial query builder
    let finalQuery: any; // Use 'any' as a temporary workaround, or a union type

    //Apply select if needed.
    if (restOfPath[0] === "select") {
      finalQuery = queryBuilder.select(restOfPath[1]);
    } else {
      finalQuery = queryBuilder; // If no select, use the initial builder
    }

    let result;
    if (request.method === "GET") {
      result = await finalQuery;
    } else if (request.method === "POST") {
      const reqBody = await request.json();
      result = await queryBuilder.insert(reqBody).select(); // Use queryBuilder here
    } else if (request.method === "PUT") {
      const reqBody = await request.json();
      result = await queryBuilder.update(reqBody).eq("id", reqBody.id).select(); // Use queryBuilder
    } else if (request.method === "DELETE") {
      const reqBody = await request.json(); //get the id.
      result = await queryBuilder.delete().eq("id", reqBody.id); //Use queryBuilder.
    } else if (request.method === "PATCH") {
      const reqBody = await request.json();
      result = await queryBuilder.update(reqBody).eq("id", reqBody.id).select(); // Use queryBuilder
    } else {
      return NextResponse.json(
        { error: "Unsupported method" },
        { status: 405 }
      );
    }

    if (result.error) {
      console.error("Supabase error:", result.error);
      return NextResponse.json(
        { error: result.error.message, details: result.error.details },
        { status: result.error.status || 500 }
      );
    }

    return NextResponse.json(result.data || [], { status: 200 });
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
