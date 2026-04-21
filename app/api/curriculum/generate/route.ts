import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCurriculumWithOpenAI } from "@/lib/openai-curriculum";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("goals, availability, active_skill_id")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[curriculum/generate] user:", user.id, "profile:", JSON.stringify(profile), "profileError:", profileError?.message);

  if (!profile?.goals?.trim()) {
    return NextResponse.json({ error: `No skill goal set (profile: ${JSON.stringify(profile)}, dbErr: ${profileError?.message})` }, { status: 400 });
  }

  const goalTitle = profile.goals.trim();

  // Resolve skill — reuse active_skill_id if already set, otherwise find/create
  let skillId: string | null = profile.active_skill_id ?? null;

  if (!skillId) {
    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .ilike("title", goalTitle)
      .maybeSingle();

    if (existing) {
      skillId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("skills")
        .insert({ title: goalTitle, description: `Learn ${goalTitle} from basics to practical application.` })
        .select("id")
        .single();
      skillId = created?.id ?? null;
    }

    if (!skillId) {
      return NextResponse.json({ error: "Could not resolve skill" }, { status: 500 });
    }

    await supabase.from("profiles").update({ active_skill_id: skillId }).eq("id", user.id);
  }

  // Return cached curriculum if lessons already exist for this user + skill
  const { data: skillLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("skill_id", skillId);

  const lessonIds = skillLessons?.map((l) => l.id) ?? [];

  if (lessonIds.length > 0) {
    const { data: userLessons } = await supabase
      .from("user_lessons")
      .select("lesson_id, completed, lessons(id, title, content_type, order_index)")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    if (userLessons?.length) {
      const lessons = userLessons
        .map((row) => {
          const l = (Array.isArray(row.lessons) ? row.lessons[0] : row.lessons) as {
            id: string; title: string; content_type: string; order_index: number;
          } | null;
          if (!l) return null;
          return { id: l.id, title: l.title, content_type: l.content_type, order_index: l.order_index, completed: row.completed };
        })
        .filter(Boolean)
        .sort((a, b) => (a!.order_index ?? 0) - (b!.order_index ?? 0));

      return NextResponse.json({ skillTitle: goalTitle, lessons });
    }
  }

  // Generate new curriculum via OpenAI
  const availability = profile.availability as { days?: string[]; time?: string } | null;
  const availabilitySummary = availability
    ? `${(availability.days ?? []).join(", ")} @ ${availability.time ?? "flex"}`
    : "flexible";

  const curriculum = await generateCurriculumWithOpenAI({
    skillTitle: goalTitle,
    goals: profile.goals,
    availabilitySummary,
  });

  const { data: insertedLessons, error: insertErr } = await supabase
    .from("lessons")
    .insert(
      curriculum.lessons.map((l) => ({
        skill_id: skillId,
        title: l.title,
        content_type: l.content_type,
        content_url: l.content_url,
        order_index: l.order_index,
      }))
    )
    .select("id, title, content_type, order_index");

  if (insertErr || !insertedLessons?.length) {
    return NextResponse.json({ error: "Failed to save lessons" }, { status: 500 });
  }

  await supabase.from("user_lessons").insert(
    insertedLessons.map((l) => ({ user_id: user.id, lesson_id: l.id, completed: false }))
  );

  if (curriculum.tasks.length) {
    const { data: insertedTasks } = await supabase
      .from("tasks")
      .insert(curriculum.tasks.map((t) => ({ skill_id: skillId, title: t.title, description: t.description, order_index: t.order_index })))
      .select("id");

    if (insertedTasks?.length) {
      await supabase.from("user_tasks").insert(
        insertedTasks.map((t) => ({ user_id: user.id, task_id: t.id, completed: false }))
      );
    }
  }

  return NextResponse.json({
    skillTitle: goalTitle,
    lessons: insertedLessons.map((l) => ({ ...l, completed: false })),
  });
}
