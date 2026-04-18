import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TaskSubmitForm } from "@/components/task/task-submit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export default async function TaskPage({ params }: { params: { taskId: string } }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("full_name,active_skill_id").eq("id", user.id).maybeSingle();
  if (!profile?.full_name?.trim()) redirect("/onboarding");
  if (!profile.active_skill_id) redirect("/skills");

  const { taskId } = params;

  const { data: task } = await supabase
    .from("tasks")
    .select("id,title,description,skill_id")
    .eq("id", taskId)
    .maybeSingle();

  if (!task || task.skill_id !== profile.active_skill_id) {
    notFound();
  }

  const { data: ut } = await supabase
    .from("user_tasks")
    .select("submission,completed")
    .eq("user_id", user.id)
    .eq("task_id", taskId)
    .maybeSingle();

  if (!ut) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{task.title ?? "Task"}</CardTitle>
          {task.description ? <CardDescription>{task.description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <TaskSubmitForm taskId={task.id} completed={Boolean(ut.completed)} initialSubmission={ut.submission} />
        </CardContent>
      </Card>
    </div>
  );
}
