// t/[slug]/page.ts  <-- Note the .ts extension
import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const metadata: Metadata = {
  title: 'Redirecting...',
};

// Helper function to fetch data
async function getData(slug: string) {
  const { data, error } = await supabase
    .from('urls')
    .select('original_url, deleted_at, is_active')
    .eq('short_id', slug)
    .single();

  return { data, error };
}

export default async function SlugPage( props : {params: Promise<{ slug: string }>}) {
  const params = await props.params;
  const { slug } = params;
  const { data, error } = await getData(slug);

  if (error || !data) {
    notFound();
  }

  if (data.deleted_at && new Date(data.deleted_at) <= new Date()) {
    notFound();
  }

  redirect(data.original_url);
}