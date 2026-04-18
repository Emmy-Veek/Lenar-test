import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CompleteLessonButton } from "@/components/lesson/complete-lesson-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

type PageProps = { params: { skillId: string; lessonId: string } };

export default async function LessonPage({ params }: PageProps) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("full_name,active_skill_id").eq("id", user.id).maybeSingle();
  if (!profile?.full_name?.trim()) redirect("/onboarding");
  if (!profile.active_skill_id) redirect("/skills");

  const { skillId, lessonId } = params;
  if (skillId !== profile.active_skill_id) {
    notFound();
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,title,content_type,content_url,skill_id")
    .eq("id", lessonId)
    .eq("skill_id", skillId)
    .maybeSingle();

  if (!lesson || lesson.skill_id !== profile.active_skill_id) {
    notFound();
  }

  const { data: ul } = await supabase
    .from("user_lessons")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!ul) {
    notFound();
  }

  const completed = Boolean(ul.completed);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title ?? "Lesson"}</CardTitle>
          <CardDescription>Type: {lesson.content_type ?? "content"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.content_url ? (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Resource</p>
              <a className="font-medium text-primary underline" href={lesson.content_url} target="_blank" rel="noreferrer">
                Open lesson link
              </a>
            </div>
          ) : null}
          <CompleteLessonButton lessonId={lesson.id} completed={completed} />
        </CardContent>
      </Card>
    </div>
  );
}
