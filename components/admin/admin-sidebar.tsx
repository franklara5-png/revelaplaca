"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Search,
  HeartPulse,
  LogOut,
} from "lucide-react";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/consultas", label: "Consultas", icon: Search },
  { href: "/admin/saude", label: "Saúde", icon: HeartPulse },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-rp-slate-100 bg-rp-surface">
      <div className="border-b border-rp-slate-100 px-4 py-4">
        <Logo variant="icon" className="text-rp-primary" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
          Admin
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const ativo = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                ativo
                  ? "bg-rp-primary-50 text-rp-primary"
                  : "text-rp-slate-600 hover:bg-rp-slate-50 hover:text-rp-ink",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAdmin} className="border-t border-rp-slate-100 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rp-slate-600 hover:bg-rp-slate-50 hover:text-rp-ink"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </aside>
  );
}
