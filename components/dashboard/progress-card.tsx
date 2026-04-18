import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  lessonPercent: number;
  taskPercent: number;
  completedLessons: number;
  totalLessons: number;
  completedTasks: number;
  totalTasks: number;
};

export function ProgressCard({ lessonPercent, taskPercent, completedLessons, totalLessons, completedTasks, totalTasks }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your progress</CardTitle>
        <CardDescription>Lessons and tasks for your active skill.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Lessons</p>
          <p className="text-2xl font-semibold">{lessonPercent}%</p>
          <p className="text-xs text-muted-foreground">
            {completedLessons} / {totalLessons} completed
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${lessonPercent}%` }} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Tasks</p>
          <p className="text-2xl font-semibold">{taskPercent}%</p>
          <p className="text-xs text-muted-foreground">
            {completedTasks} / {totalTasks} completed
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${taskPercent}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
