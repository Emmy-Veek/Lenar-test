import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Lenar</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Learn any skill with a plan that fits your life
        </h1>
        <p className="text-lg text-muted-foreground">
          Curated lessons, light tasks, and progress you can see — built for busy beginners, hobbyists, and pros.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/onboarding">Get started</Link>
          </Button>
        </div>
        <Card className="text-left">
          <CardHeader>
            <CardTitle>What you will do first</CardTitle>
            <CardDescription>Create an account, set your goals and availability, pick a skill, then open your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Configure Supabase env vars locally (see <code className="rounded bg-muted px-1">.env.example</code>) before auth and data features work end-to-end.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
