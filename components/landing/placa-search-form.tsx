"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";

export function PlacaSearchForm({
  id,
  /** Avisa o que esta sendo digitado. O hero usa para espelhar na placa 3D. */
  onPlacaChange,
}: {
  id?: string;
  onPlacaChange?: (placa: string) => void;
}) {
  const router = useRouter();
  const [placa, setPlaca] = useState("");
  const [erro, setErro] = useState("");

  // O formulario aparece duas vezes na home (hero e CTA final), entao um id
  // fixo geraria id duplicado no DOM e o <label for> apontaria para o campo
  // errado. useId da um por instancia.
  const campoId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalizada = normalizarPlaca(placa);

    if (!validarPlaca(normalizada)) {
      setErro("Digite uma placa válida (ex: ABC1D23 ou ABC1234)");
      return;
    }

    setErro("");
    router.push(`/consulta/${normalizada}`);
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="w-full max-w-xl">
      {/* Placeholder nao e rotulo: some quando a pessoa digita e nao satisfaz
          leitor de tela. Rotulo real, escondido visualmente. */}
      <label htmlFor={campoId} className="sr-only">
        Placa do veículo
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id={campoId}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={8}
          placeholder="Digite a placa"
          value={placa}
          onChange={(e) => {
            setPlaca(e.target.value);
            onPlacaChange?.(e.target.value);
            if (erro) setErro("");
          }}
          aria-invalid={!!erro}
          aria-describedby={erro ? `${campoId}-erro` : undefined}
        />
        <Button type="submit" size="lg" className="shrink-0 sm:px-8">
          <Search className="h-4 w-4" />
          Revelar grátis
        </Button>
      </div>
      {erro && (
        <p id={`${campoId}-erro`} className="mt-2 text-sm text-rp-red-500">
          {erro}
        </p>
      )}
      <p className="mt-3 text-sm text-rp-slate-400">
        Formatos aceitos: antigo (ABC1234) e Mercosul (ABC1D23)
      </p>
    </form>
  );
}
