// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (use with 'use client' components)
export const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);


// Server-side Supabase client (use in API routes and Server Components)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseServer: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);