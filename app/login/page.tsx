import type { Metadata } from "next";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { AuthForm } from "@/components/AuthForm";
import { getSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getSeoMetadata({
  title: "Entrar",
  description: "Acesse sua conta RevelaPlaca para ver relatórios e histórico.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  // pt-28 e o vao do cabecalho, que e fixed: com py-16 o titulo passava por
  // baixo dele. O padding e respeitado pela centralizacao do flex, entao o
  // conteudo nunca sobe alem dele.
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-rp-ink">Entrar no RevelaPlaca</h1>
          <p className="text-rp-slate-400 text-sm">
            Acesse seus relatórios e seu histórico de consultas
          </p>
        </div>

        <GoogleLoginButton />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-rp-slate-100" />
          <span className="text-xs text-rp-slate-400">ou</span>
          <span className="h-px flex-1 bg-rp-slate-100" />
        </div>

        <AuthForm />

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
