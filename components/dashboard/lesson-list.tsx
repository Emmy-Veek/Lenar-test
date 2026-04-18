import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type LessonRow = {
  id: string;
  title: string | null;
  skill_id: string | null;
  completed: boolean;
};

export function LessonList({ lessons }: { lessons: LessonRow[] }) {
  if (!lessons.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lessons</CardTitle>
          <CardDescription>No lessons yet. Generate your plan to get started.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lessons</CardTitle>
        <CardDescription>Open a lesson and mark it complete when you are done.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((l) => (
          <div
            key={l.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{l.title ?? "Lesson"}</p>
              <p className="text-xs text-muted-foreground">{l.completed ? "Completed" : "Not started"}</p>
            </div>
            {l.skill_id ? (
              <Button size="sm" variant={l.completed ? "outline" : "default"} asChild>
                <Link href={`/learn/${l.skill_id}/${l.id}`}>{l.completed ? "Review" : "Start"}</Link>
              </Button>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
