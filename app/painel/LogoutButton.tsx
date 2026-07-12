"use client";

import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-rp-red-500 border border-rp-red-200 rounded-2xl hover:bg-rp-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair da conta
    </button>
  );
}
