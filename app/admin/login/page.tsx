import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getSeoMetadata({
  title: "Login — Admin",
  description: "Login do painel administrativo.",
  path: "/admin/login",
  noindex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <AdminLoginForm />
    </div>
  );
}
