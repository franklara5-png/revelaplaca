"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";

type Modo = "entrar" | "cadastrar" | "esqueci";

// As mensagens do better-auth chegam em ingles e vao direto para o cliente.
// Traduzidas por codigo; o texto cru nunca aparece na tela.
const ERROS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  INVALID_EMAIL: "E-mail inválido.",
  INVALID_PASSWORD: "Senha incorreta.",
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail. Tente entrar.",
  USER_NOT_FOUND: "Não encontramos uma conta com este e-mail.",
  EMAIL_NOT_VERIFIED:
    "Confirme seu e-mail antes de entrar. Procure a mensagem que enviamos.",
  PASSWORD_TOO_SHORT: "A senha precisa de pelo menos 8 caracteres.",
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    "Esta conta foi criada com o Google. Entre pelo botão do Google.",
};

function traduzirErro(codigo?: string, mensagem?: string): string {
  if (codigo && ERROS[codigo]) return ERROS[codigo];
  if (mensagem && /already exists/i.test(mensagem)) return ERROS.USER_ALREADY_EXISTS;
  if (mensagem && /not verified/i.test(mensagem)) return ERROS.EMAIL_NOT_VERIFIED;
  return "Não foi possível concluir. Tente novamente em instantes.";
}

const CAMPO =
  "w-full rounded-xl border border-rp-slate-100 bg-white px-4 py-3 text-sm text-rp-ink outline-none transition-colors focus:border-rp-primary-600";

export function AuthForm() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErro(null);
    setAviso(null);
    setSenha("");
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    setAviso(null);

    try {
      if (modo === "esqueci") {
        const { error } = await authClient.requestPasswordReset({
          email,
          redirectTo: "/redefinir-senha",
        });
        if (error) {
          setErro(traduzirErro(error.code, error.message));
        } else {
          // Resposta igual exista ou nao a conta: dizer "esse e-mail nao tem
          // cadastro" entrega a terceiros quem e cliente do site.
          setAviso(
            "Se houver uma conta com este e-mail, enviamos o link para criar uma senha nova.",
          );
        }
        return;
      }

      if (modo === "cadastrar") {
        const { error } = await authClient.signUp.email({
          name: nome.trim(),
          email,
          password: senha,
          callbackURL: "/painel",
        });
        if (error) {
          setErro(traduzirErro(error.code, error.message));
        } else {
          setAviso(
            "Conta criada. Enviamos um e-mail para você confirmar o endereço — é o que libera a entrada.",
          );
        }
        return;
      }

      const { error } = await authClient.signIn.email({
        email,
        password: senha,
        callbackURL: "/painel",
      });
      if (error) setErro(traduzirErro(error.code, error.message));
    } catch {
      setErro("Não foi possível concluir. Tente novamente em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-4">
      {modo !== "esqueci" && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-rp-slate-100 p-1">
          {(["entrar", "cadastrar"] as const).map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => trocarModo(valor)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                modo === valor
                  ? "bg-white text-rp-ink shadow-sm"
                  : "text-rp-slate-600 hover:text-rp-ink"
              }`}
            >
              {valor === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={enviar} className="space-y-3">
        {modo === "cadastrar" && (
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={CAMPO}
          />
        )}

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={CAMPO}
        />

        {modo !== "esqueci" && (
          <input
            type="password"
            required
            minLength={8}
            autoComplete={modo === "cadastrar" ? "new-password" : "current-password"}
            placeholder={modo === "cadastrar" ? "Senha (mínimo 8 caracteres)" : "Sua senha"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={CAMPO}
          />
        )}

        {erro && (
          <p className="rounded-xl bg-rp-red-500/10 px-4 py-3 text-sm text-rp-red-500">
            {erro}
          </p>
        )}

        {aviso && (
          <p className="flex items-start gap-2 rounded-xl bg-rp-emerald-500/10 px-4 py-3 text-sm text-rp-ink">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-rp-emerald-500" />
            {aviso}
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
            <Mail className="h-4 w-4" />
          )}
          {modo === "entrar"
            ? "Entrar"
            : modo === "cadastrar"
              ? "Criar conta"
              : "Enviar link"}
        </button>
      </form>

      <div className="text-center text-xs text-rp-slate-400">
        {modo === "esqueci" ? (
          <button
            type="button"
            onClick={() => trocarModo("entrar")}
            className="underline hover:text-rp-slate-600"
          >
            Voltar para entrar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => trocarModo("esqueci")}
            className="underline hover:text-rp-slate-600"
          >
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  );
}
