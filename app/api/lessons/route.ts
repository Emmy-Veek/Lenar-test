import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function parseLessonRelation(
  v: unknown
): {
  id: string;
  title: string | null;
  content_type: string | null;
  content_url: string | null;
  order_index: number | null;
  skill_id: string | null;
} | null {
  const row = (Array.isArray(v) ? v[0] : v) as Record<string, unknown> | null | undefined;
  if (!row || typeof row.id !== "string") return null;
  return {
    id: row.id,
    title: typeof row.title === "string" ? row.title : null,
    content_type: typeof row.content_type === "string" ? row.content_type : null,
    content_url: typeof row.content_url === "string" ? row.content_url : null,
    order_index: typeof row.order_index === "number" ? row.order_index : null,
    skill_id: typeof row.skill_id === "string" ? row.skill_id : null,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("user_lessons")
    .select("completed, completed_at, lessons(id,title,content_type,content_url,order_index,skill_id)")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const skillIds = Array.from(
    new Set(rows?.map((r) => parseLessonRelation(r.lessons)?.skill_id).filter((id): id is string => Boolean(id)) ?? [])
  );

  const skillTitleById = new Map<string, string>();
  if (skillIds.length) {
    const { data: skills } = await supabase.from("skills").select("id,title").in("id", skillIds);
    skills?.forEach((s) => skillTitleById.set(s.id, s.title));
  }

  const lessons =
    rows
      ?.map((r) => {
        const lesson = parseLessonRelation(r.lessons);
        if (!lesson) return null;
        return {
          id: lesson.id,
          title: lesson.title,
          content_type: lesson.content_type,
          content_url: lesson.content_url,
          order_index: lesson.order_index,
          skill_id: lesson.skill_id,
          skill_title: lesson.skill_id ? skillTitleById.get(lesson.skill_id) ?? null : null,
          completed: r.completed,
          completed_at: r.completed_at,
        };
      })
      .filter(Boolean) ?? [];

  lessons.sort((a, b) => (a!.order_index ?? 0) - (b!.order_index ?? 0));

  return NextResponse.json({ lessons });
}
