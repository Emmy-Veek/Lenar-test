import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Slot = { label: string };

export function ScheduleCard({ slots }: { slots: Slot[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming focus times</CardTitle>
        <CardDescription>Based on your availability (MVP display). Google Calendar sync comes next.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {slots.map((s) => (
            <li key={s.label} className="rounded-md border bg-muted/40 px-3 py-2">
              {s.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
