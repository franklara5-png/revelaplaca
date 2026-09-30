import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";
import { RedefinirSenhaForm } from "./RedefinirSenhaForm";

export const metadata: Metadata = getSeoMetadata({
  title: "Redefinir senha",
  description: "Crie uma senha nova para sua conta RevelaPlaca.",
  path: "/redefinir-senha",
  noindex: true,
});

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  // Mesmo vao do login: o cabecalho e fixed e py-16 nao o limpa.
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-rp-ink">Criar senha nova</h1>
          <p className="text-rp-slate-400 text-sm">
            Escolha uma senha de pelo menos 8 caracteres.
          </p>
        </div>

        <RedefinirSenhaForm token={token} expirado={Boolean(error) || !token} />
      </div>
    </main>
  );
}
