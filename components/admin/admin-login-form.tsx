"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/admin-auth";
import { Logo } from "@/components/brand";
import { Button, Card, Input } from "@/components/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const resultado = await loginAdmin(senha);
    setCarregando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <Logo className="justify-center" />
      <h1 className="mt-6 text-center text-lg font-bold text-rp-ink">
        Painel administrativo
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="senha" className="text-sm font-medium text-rp-ink">
            Senha
          </label>
          <Input
            id="senha"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-2 normal-case tracking-normal"
          />
        </div>
        {erro && (
          <p className="text-sm text-rp-danger" role="alert">
            {erro}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </Card>
  );
}
