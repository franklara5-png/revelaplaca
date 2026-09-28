"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";

import { authClient } from "@/lib/auth-client";

const CAMPO =
  "w-full rounded-xl border border-rp-slate-100 bg-white px-4 py-3 text-sm text-rp-ink outline-none transition-colors focus:border-rp-primary-600";

export function RedefinirSenhaForm({
  token,
  expirado,
}: {
  token?: string;
  expirado: boolean;
}) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Link vencido ou adulterado: mandar de volta pedir outro, em vez de
  // deixar a pessoa tentar uma senha que nunca vai ser aceita.
  if (expirado || !token) {
    return (
      <div className="space-y-4 text-center">
        <p className="flex items-start gap-2 rounded-xl bg-rp-amber-500/10 px-4 py-3 text-left text-sm text-rp-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rp-amber-500" />
          Este link não vale mais. Os links de senha expiram em 1 hora, por
          segurança.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-[var(--rp-radius)] bg-rp-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rp-primary-700"
        >
          Pedir um link novo
        </Link>
      </div>
    );
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (senha !== confirmacao) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setCarregando(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: senha,
        token,
      });

      if (error) {
        setErro(
          "Não foi possível redefinir. O link pode ter expirado — peça outro na tela de entrar.",
        );
        return;
      }

      router.push("/login?senha=alterada");
    } catch {
      setErro("Não foi possível concluir. Tente novamente em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <input
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Senha nova"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={CAMPO}
      />
      <input
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Repita a senha nova"
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        className={CAMPO}
      />

      {erro && (
        <p className="rounded-xl bg-rp-red-500/10 px-4 py-3 text-sm text-rp-red-500">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--rp-radius)] bg-rp-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rp-primary-700 disabled:opacity-60"
      >
        {carregando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        Salvar senha
      </button>
    </form>
  );
}
