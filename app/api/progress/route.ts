import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count: lessonTotal, error: ltError } = await supabase
    .from("user_lessons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (ltError) {
    return NextResponse.json({ error: ltError.message }, { status: 500 });
  }

  const { count: lessonDone, error: ldError } = await supabase
    .from("user_lessons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);
  if (ldError) {
    return NextResponse.json({ error: ldError.message }, { status: 500 });
  }

  const { count: taskTotal, error: ttError } = await supabase
    .from("user_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (ttError) {
    return NextResponse.json({ error: ttError.message }, { status: 500 });
  }

  const { count: taskDone, error: tdError } = await supabase
    .from("user_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);
  if (tdError) {
    return NextResponse.json({ error: tdError.message }, { status: 500 });
  }

  const totalLessons = lessonTotal ?? 0;
  const completedLessons = lessonDone ?? 0;
  const totalTasks = taskTotal ?? 0;
  const completedTasks = taskDone ?? 0;

  const lessonPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const taskPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return NextResponse.json({
    lessons: { total: totalLessons, completed: completedLessons, percent: lessonPct },
    tasks: { total: totalTasks, completed: completedTasks, percent: taskPct },
  });
}
