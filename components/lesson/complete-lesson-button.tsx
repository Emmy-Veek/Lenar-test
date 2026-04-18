"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CompleteLessonButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (completed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        console.error(body.error);
        return;
      }
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ event: "lesson_completed", metadata: { lessonId } }),
      }).catch(() => {});
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" disabled={completed || loading} onClick={onClick}>
      {completed ? "Completed" : loading ? "Saving…" : "Mark complete"}
    </Button>
  );
}
