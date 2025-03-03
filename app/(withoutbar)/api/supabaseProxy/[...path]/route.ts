// app/api/supabaseProxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}
export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}
export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}
export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}
export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

async function handleRequest(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = await context.params; // Correct: Access params directly (NO await)
  const pathString = path.join('/');

  try {
    const supabase = createSupabaseAdmin(request); // Create client *inside*
    let supabaseMethod: any = supabase;

    const parts = pathString.split('/');
      for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (typeof supabaseMethod[part] === 'function') {
              if (i === parts.length - 1) {
                  // Last part, call the function
                  if(request.method !== 'GET'){
                    const reqBody = await request.json()
                    supabaseMethod = await supabaseMethod[part](reqBody);
                  }
                  else{
                    supabaseMethod = await supabaseMethod[part]();
                  }

              }
              else {
                supabaseMethod = supabaseMethod[part]
              }
          } else if(supabaseMethod.constructor.name === "SupabaseClient"){
              //if part is not function, continue.
              continue;
          }
            else{
              //It's not a function, so it must be an argument
              supabaseMethod = supabaseMethod(part);
          }
      }

    if (supabaseMethod.error) {
      console.error("Supabase error:", supabaseMethod.error);
      return new NextResponse(JSON.stringify({ error: supabaseMethod.error.message }), {
        status: supabaseMethod.error.status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new NextResponse(JSON.stringify(supabaseMethod.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}