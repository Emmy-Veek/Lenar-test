import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type TaskRow = {
  id: string;
  title: string | null;
  completed: boolean;
};

export function TaskList({ tasks }: { tasks: TaskRow[] }) {
  if (!tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tasks</CardTitle>
          <CardDescription>Tasks appear after your first lessons are generated.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tasks</CardTitle>
        <CardDescription>Short reflections or mini-projects to lock in learning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{t.title ?? "Task"}</p>
              <p className="text-xs text-muted-foreground">{t.completed ? "Submitted" : "Pending"}</p>
            </div>
            <Button size="sm" variant={t.completed ? "outline" : "default"} asChild>
              <Link href={`/task/${t.id}`}>{t.completed ? "View" : "Open"}</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
