"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";

export function PlacaSearchForm({ id }: { id?: string }) {
  const router = useRouter();
  const [placa, setPlaca] = useState("");
  const [erro, setErro] = useState("");

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
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={8}
          placeholder="Digite a placa"
          value={placa}
          onChange={(e) => {
            setPlaca(e.target.value);
            if (erro) setErro("");
          }}
          aria-invalid={!!erro}
          aria-describedby={erro ? "placa-erro" : undefined}
        />
        <Button type="submit" size="lg" className="shrink-0 sm:px-8">
          <Search className="h-4 w-4" />
          Revelar grátis
        </Button>
      </div>
      {erro && (
        <p id="placa-erro" className="mt-2 text-sm text-rp-red-500">
          {erro}
        </p>
      )}
      <p className="mt-3 text-sm text-rp-slate-400">
        Formatos aceitos: antigo (ABC1234) e Mercosul (ABC1D23)
      </p>
    </form>
  );
}
