// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Custom interface for RequestInit (best practice)
interface CustomRequestInit extends RequestInit {
  duplex?: 'half' | 'full';
}

// Route handler functions (GET, POST, etc.)
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, (await context.params).path);
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return handleRequest(request, (await context.params).path);
}
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return handleRequest(request, (await context.params).path);
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return handleRequest(request, (await context.params).path);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return handleRequest(request, (await context.params).path);
}

// Helper function to handle the request
async function handleRequest(request: NextRequest, path: string[]) { // Corrected parameter
  try {
    const pathString = path.join('/');
    const apiUrl = `http://10.0.0.136:7000/${pathString}`;

    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      headers.set(key, value);
    }
    headers.set('host', '10.0.0.136:7000');

    const apiResponse = await fetch(apiUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      duplex: 'half',
    } as CustomRequestInit); // Use custom interface

    const responseHeaders = new Headers();
    for (const [key, value] of apiResponse.headers.entries()) {
      responseHeaders.set(key, value);
    }

    return new NextResponse(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}