import { redirect } from "next/navigation";

import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button";
import { LessonList } from "@/components/dashboard/lesson-list";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { ScheduleCard } from "@/components/dashboard/schedule-card";
import { TaskList } from "@/components/dashboard/task-list";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { upcomingSlots } from "@/lib/schedule";
import type { Availability } from "@/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile?.goals?.trim()) {
    redirect("/onboarding");
  }
  if (!profile.active_skill_id) {
    redirect("/curriculum");
  }

  const skillId = profile.active_skill_id;

  const { data: skill } = await supabase.from("skills").select("title").eq("id", skillId).maybeSingle();

  const { data: userLessonRows } = await supabase
    .from("user_lessons")
    .select("completed, lessons(id,title,skill_id)")
    .eq("user_id", user.id);

  function parseLessonRelation(v: unknown): { id: string; title: string | null; skill_id: string | null } | null {
    const row = (Array.isArray(v) ? v[0] : v) as Record<string, unknown> | null | undefined;
    if (!row || typeof row.id !== "string") return null;
    return {
      id: row.id,
      title: typeof row.title === "string" ? row.title : null,
      skill_id: typeof row.skill_id === "string" ? row.skill_id : null,
    };
  }

  const lessonsForSkill =
    userLessonRows
      ?.map((row) => {
        const lesson = parseLessonRelation(row.lessons);
        if (!lesson || lesson.skill_id !== skillId) return null;
        return { id: lesson.id, title: lesson.title, skill_id: lesson.skill_id, completed: row.completed };
      })
      .filter(Boolean) ?? [];

  const { data: userTaskRows } = await supabase
    .from("user_tasks")
    .select("completed, tasks(id,title,skill_id)")
    .eq("user_id", user.id);

  function parseTaskRelation(v: unknown): { id: string; title: string | null; skill_id: string | null } | null {
    const row = (Array.isArray(v) ? v[0] : v) as Record<string, unknown> | null | undefined;
    if (!row || typeof row.id !== "string") return null;
    return {
      id: row.id,
      title: typeof row.title === "string" ? row.title : null,
      skill_id: typeof row.skill_id === "string" ? row.skill_id : null,
    };
  }

  const tasksForSkill =
    userTaskRows
      ?.map((row) => {
        const task = parseTaskRelation(row.tasks);
        if (!task || task.skill_id !== skillId) return null;
        return { id: task.id, title: task.title, completed: row.completed };
      })
      .filter(Boolean) ?? [];

  const totalLessons = lessonsForSkill.length;
  const completedLessons = lessonsForSkill.filter((l) => l?.completed).length;
  const totalTasks = tasksForSkill.length;
  const completedTasks = tasksForSkill.filter((t) => t?.completed).length;
  const lessonPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const taskPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const slots = upcomingSlots((profile.availability as Availability | null) ?? null).map((s) => ({ label: s.label }));

  const hasPlan = totalLessons > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Active skill: <span className="font-medium text-foreground">{skill?.title ?? "Your skill"}</span>
        </p>
      </div>

      {!hasPlan ? (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-medium">Generate your first plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We will create lessons and tasks from your goals and availability. You can refine calendar sync later.
          </p>
          <div className="mt-4">
            <GeneratePlanButton skillId={skillId} />
          </div>
        </div>
      ) : null}

      <ProgressCard
        lessonPercent={lessonPct}
        taskPercent={taskPct}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LessonList
          lessons={
            lessonsForSkill as {
              id: string;
              title: string | null;
              skill_id: string | null;
              completed: boolean;
            }[]
          }
        />
        <TaskList tasks={tasksForSkill as { id: string; title: string | null; completed: boolean }[]} />
      </div>

      <ScheduleCard slots={slots} />
    </div>
  );
}
