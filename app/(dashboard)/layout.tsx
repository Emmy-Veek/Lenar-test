import { Navbar } from "@/components/layout/navbar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
