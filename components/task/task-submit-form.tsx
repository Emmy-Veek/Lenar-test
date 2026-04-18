"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TaskSubmitForm({
  taskId,
  completed,
  initialSubmission,
}: {
  taskId: string;
  completed: boolean;
  initialSubmission: string | null;
}) {
  const router = useRouter();
  const [submission, setSubmission] = useState(initialSubmission ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ taskId, submission }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Submit failed");
        return;
      }
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ event: "task_submitted", metadata: { taskId } }),
      }).catch(() => {});
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="submission">Your response</Label>
        <textarea
          id="submission"
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          disabled={completed}
          rows={5}
          placeholder="Reflection, notes, or mini-project summary"
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      <Button type="submit" disabled={completed || loading || !submission.trim()}>
        {completed ? "Submitted" : loading ? "Submitting…" : "Submit task"}
      </Button>
    </form>
  );
}
