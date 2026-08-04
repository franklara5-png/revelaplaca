import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...getSeoMetadata({
    title: "Admin",
    description: "Painel administrativo RevelaPlaca.",
    path: "/admin",
    noindex: true,
  }),
  title: { default: "Admin", template: "%s | Admin" },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
