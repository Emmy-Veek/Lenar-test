import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/onboarding";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous Sign-In Error:", error.message);
    return new Response(`Authentication Error: ${error.message}. Please make sure Anonymous Sign-ins is enabled in your Supabase Dashboard, and you have restarted your Next.js server after adding the .env.local file.`, { status: 500 });
  }

  // Once the session is properly attached, redirect to the desired route
  redirect(next);
}
