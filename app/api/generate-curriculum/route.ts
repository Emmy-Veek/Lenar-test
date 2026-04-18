import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { generateCurriculumWithOpenAI } from "@/lib/openai-curriculum";

const bodySchema = z.object({
  skillId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { skillId } = parsed.data;

  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("id,title")
    .eq("id", skillId)
    .maybeSingle();
  if (skillError || !skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const { data: skillLessons, error: slError } = await supabase.from("lessons").select("id").eq("skill_id", skillId);
  if (slError) {
    return NextResponse.json({ error: slError.message }, { status: 500 });
  }
  const lessonIdsForSkill = skillLessons?.map((r) => r.id) ?? [];

  if (lessonIdsForSkill.length > 0) {
    const { data: existingProgress, error: epError } = await supabase
      .from("user_lessons")
      .select("lesson_id, completed, completed_at")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIdsForSkill)
      .limit(1);
    if (epError) {
      return NextResponse.json({ error: epError.message }, { status: 500 });
    }
    if (existingProgress && existingProgress.length > 0) {
      const { data: allUserLessons, error: ulFetchError } = await supabase
        .from("user_lessons")
        .select("lesson_id, completed, completed_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIdsForSkill);
      if (ulFetchError) {
        return NextResponse.json({ error: ulFetchError.message }, { status: 500 });
      }
      const { data: lessonRows, error: lrError } = await supabase
        .from("lessons")
        .select("id,title,content_type,content_url,order_index,skill_id")
        .in("id", lessonIdsForSkill)
        .order("order_index", { ascending: true });
      if (lrError) {
        return NextResponse.json({ error: lrError.message }, { status: 500 });
      }
      const progressByLesson = new Map(allUserLessons?.map((r) => [r.lesson_id, r]) ?? []);
      const lessonsOut =
        lessonRows?.map((l) => ({
          ...l,
          completed: progressByLesson.get(l.id)?.completed ?? false,
          completed_at: progressByLesson.get(l.id)?.completed_at ?? null,
        })) ?? [];

      const { data: skillTasks } = await supabase.from("tasks").select("id").eq("skill_id", skillId);
      const taskIds = skillTasks?.map((t) => t.id) ?? [];
      let tasksOut: Record<string, unknown>[] = [];
      if (taskIds.length) {
        const { data: ut } = await supabase
          .from("user_tasks")
          .select("task_id, submission, completed, created_at, tasks(id,title,description,order_index,skill_id)")
          .eq("user_id", user.id)
          .in("task_id", taskIds);
        const parseTask = (v: unknown) => {
          const t = (Array.isArray(v) ? v[0] : v) as Record<string, unknown> | null | undefined;
          return t ?? {};
        };
        const mapped: Record<string, unknown>[] =
          ut?.map((row) => ({
            ...parseTask(row.tasks),
            submission: row.submission,
            completed: row.completed,
            created_at: row.created_at,
          })) ?? [];
        tasksOut = mapped.sort(
          (a, b) =>
            (typeof a.order_index === "number" ? a.order_index : 0) -
            (typeof b.order_index === "number" ? b.order_index : 0)
        );
      }

      return NextResponse.json({ cached: true, lessons: lessonsOut, tasks: tasksOut });
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("goals,availability")
    .eq("id", user.id)
    .maybeSingle();

  const availability = profile?.availability as { days?: string[]; time?: string } | null;
  const availabilitySummary = availability
    ? `${(availability.days ?? []).join(", ")} @ ${availability.time ?? "flex"}`
    : "flexible";

  const curriculum = await generateCurriculumWithOpenAI({
    skillTitle: skill.title,
    goals: profile?.goals ?? null,
    availabilitySummary,
  });

  const lessonRows = curriculum.lessons.map((l) => ({
    skill_id: skillId,
    title: l.title,
    content_type: l.content_type,
    content_url: l.content_url,
    order_index: l.order_index,
  }));

  const { data: insertedLessons, error: insertLessonsError } = await supabase
    .from("lessons")
    .insert(lessonRows)
    .select("id,title,content_type,content_url,order_index,skill_id");
  if (insertLessonsError || !insertedLessons?.length) {
    return NextResponse.json({ error: insertLessonsError?.message ?? "Failed to save lessons" }, { status: 500 });
  }

  const userLessonRows = insertedLessons.map((lesson) => ({
    user_id: user.id,
    lesson_id: lesson.id,
    completed: false,
  }));
  const { error: ulInsertError } = await supabase.from("user_lessons").insert(userLessonRows);
  if (ulInsertError) {
    return NextResponse.json({ error: ulInsertError.message }, { status: 500 });
  }

  const taskRows = curriculum.tasks.map((t) => ({
    skill_id: skillId,
    title: t.title,
    description: t.description,
    order_index: t.order_index,
  }));

  let insertedTasks: { id: string; title: string | null; description: string | null; order_index: number | null; skill_id: string | null }[] =
    [];
  if (taskRows.length) {
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .insert(taskRows)
      .select("id,title,description,order_index,skill_id");
    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }
    insertedTasks = tasksData ?? [];
    if (insertedTasks.length) {
      const userTaskRows = insertedTasks.map((task) => ({
        user_id: user.id,
        task_id: task.id,
        completed: false,
      }));
      const { error: utError } = await supabase.from("user_tasks").insert(userTaskRows);
      if (utError) {
        return NextResponse.json({ error: utError.message }, { status: 500 });
      }
    }
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ active_skill_id: skillId })
    .eq("id", user.id);
  if (profileUpdateError) {
    return NextResponse.json({ error: profileUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({
    cached: false,
    lessons: insertedLessons.map((l) => ({ ...l, completed: false, completed_at: null })),
    tasks: insertedTasks,
  });
}
