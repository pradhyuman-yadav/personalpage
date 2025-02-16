// app/textshare/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import TextShareDisplay from "./TextShareDisplay";
import { Metadata } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TextShare {
  id: number;
  title: string | null;
  content: string;
  created_at: string;
  expires_at: string | null;
  short_id: string;
  syntax_highlighting: string;
}

// Optional: Add metadata for better SEO
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  const { data, error } = await supabase
    .from("pastes")
    .select("title") // Only select necessary fields for metadata
    .eq("short_id", slug)
    .single();

  if (error || !data) {
    return {
      title: "Text Share Not Found",
    };
  }

  return {
    title: data.title || "Untitled Text Share",
    description: `View text share with ID: ${slug}`, // Add a description
    // Add other metadata as needed (e.g., open graph tags)
  };
}

export default async function TextSharePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const { data, error } = await supabase
    .from("pastes")
    .select("*")
    .eq("short_id", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const textShare: TextShare = data;

  if (textShare.expires_at && new Date(textShare.expires_at) <= new Date()) {
    notFound();
  }

  return <TextShareDisplay textShare={textShare} />;
}
