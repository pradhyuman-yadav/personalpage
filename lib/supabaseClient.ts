// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (use with 'use client' components)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const createSupabaseAdmin = () => {
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};