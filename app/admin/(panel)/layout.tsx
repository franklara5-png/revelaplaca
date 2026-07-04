import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-var(--rp-header-height))]">
      <AdminSidebar />
      <div className="min-w-0 flex-1 overflow-auto bg-rp-bg p-6">{children}</div>
    </div>
  );
}
