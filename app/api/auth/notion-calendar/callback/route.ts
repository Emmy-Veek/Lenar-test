import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/schedule?error=notion_denied`);
  }

  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", { signal: AbortSignal.timeout(30000),
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/auth/notion-calendar/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/schedule?error=notion_token`);
  }

  const { access_token } = await tokenRes.json();

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
            notion: { access_token, connected_at: new Date().toISOString() },
          },
        },
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(`${appUrl}/schedule?calendar=notion&connected=true`);
}
