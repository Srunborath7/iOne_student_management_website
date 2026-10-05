import Sidebar from "@/src/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 min-h-screen px-10 py-10">{children}</main>
    </div>
  );
}
