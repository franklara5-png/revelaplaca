import type { Metadata } from "next";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-rp-ink">Entrar no RevelaPlaca</h1>
          <p className="text-rp-slate-500 text-sm">
            Use sua conta Google para acessar seus relatórios e histórico
          </p>
        </div>

        <GoogleLoginButton />

        <p className="text-xs text-center text-rp-slate-400 leading-relaxed">
          Ao entrar, você concorda com os{" "}
          <a href="/termos" className="underline hover:text-rp-slate-600">Termos de Uso</a>
          {" "}e a{" "}
          <a href="/privacidade" className="underline hover:text-rp-slate-600">Política de Privacidade</a>.
        </p>
      </div>
    </main>
  );
}
