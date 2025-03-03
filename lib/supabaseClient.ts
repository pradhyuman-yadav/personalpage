// lib/supabaseClient.ts
import { CookieOptions, createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (use with 'use client' components)
export const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);


// Server-side Supabase client (use in API routes and Server Components)

export const createSupabaseAdmin = (request: NextRequest) => { // <--- TAKE NextRequest
    return createServerClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value; // Use request.cookies
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options }); // Use request.cookies
                    //You MUST do this in route handler
                    const response = NextResponse.next()
                    response.cookies.set({
                        name: name,
                        value: value,
                        ...options
                    })
                },
                remove(name: string) {
                    request.cookies.delete(name);
                    const response = NextResponse.next()
                    response.cookies.delete(name)
                }
            },
        }
    );
};