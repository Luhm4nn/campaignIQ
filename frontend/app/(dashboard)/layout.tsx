import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />
      <main className="relative pl-[240px]">
        <div className="min-h-screen max-w-[1440px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
