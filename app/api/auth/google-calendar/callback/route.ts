import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/schedule?error=google_denied`);
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google-calendar/callback`,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return NextResponse.redirect(`${appUrl}/schedule?error=google_timeout`);
  }

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/schedule?error=google_token`);
  }

  const { access_token, refresh_token } = await tokenRes.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("availability")
      .eq("id", user.id)
      .single();

    const existing = (profile?.availability as Record<string, unknown>) ?? {};
    const existingCalendars = (existing.calendars as Record<string, unknown>) ?? {};

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        availability: {
          ...existing,
          calendars: {
            ...existingCalendars,
            google: { access_token, refresh_token, connected_at: new Date().toISOString() },
          },
        },
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(`${appUrl}/schedule?calendar=google&connected=true`);
}
