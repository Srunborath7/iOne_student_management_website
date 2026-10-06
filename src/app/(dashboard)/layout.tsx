import Sidebar from "@/src/components/Sidebar";
import RoleGuard from "@/src/components/RoleGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-h-screen min-w-0 px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 md:ml-64 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <RoleGuard>{children}</RoleGuard>
      </main>
    </div>
  );
}
