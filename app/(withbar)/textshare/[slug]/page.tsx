// app/textshare/[slug]/page.tsx
import { notFound } from "next/navigation";
import TextShareDisplay from "./TextShareDisplay";
import { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabaseClient";
// import { headers } from 'next/headers'; //for getting headers
// import { NextRequest } from "next/server";

interface TextShare {
  id: number;
  title: string | null;
  content: string;
  created_at: string;
  expires_at: string | null;
  short_id: string;
  syntax_highlighting: string;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  // const requestHeaders = new Headers(await headers())
  // const request = new NextRequest(new URL(`http://dummy.com`), { //dummy url
  //     headers: requestHeaders
  // })
  const supabase =  createSupabaseAdmin(); // Create client
  const { data, error } = await supabase
      .from("pastes")
      .select("title")
      .eq("short_id", slug)
      .single();

  if (error || !data) {
    return {
      title: "Text Share Not Found",
    };
  }

  return {
    title: data.title || "Untitled Text Share",
    description: `View text share with ID: ${slug}`,
  };
}

export default async function TextSharePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  // const requestHeaders = new Headers(await headers())
  // const request = new NextRequest(new URL(`http://dummy.com`), { //dummy url
  //     headers: requestHeaders
  // })
  const supabase =  createSupabaseAdmin(); // Create client at top level
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