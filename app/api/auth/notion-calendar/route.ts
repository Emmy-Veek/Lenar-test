import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json({ error: "Notion Calendar is not configured." }, { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/notion-calendar/callback`,
    response_type: "code",
    owner: "user",
  });

  return NextResponse.redirect(
    `https://api.notion.com/v1/oauth/authorize?${params}`
  );
}
