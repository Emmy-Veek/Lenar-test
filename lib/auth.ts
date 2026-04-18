import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function requireUser(nextUrl?: string) {
  const user = await getSessionUser();
  if (!user) {
    const next = nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : "";
    redirect(`/auth/anonymous${next}`);
  }
  return user;
}
