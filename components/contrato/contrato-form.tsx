"use client";

import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import type { DadosContrato } from "@/lib/contrato/schema";

type Props = {
  valoresIniciais?: Partial<DadosContrato>;
};

const CAMPOS: Array<{
  secao: string;
  campos: Array<{ name: keyof DadosContrato; label: string; required?: boolean }>;
}> = [
  {
    secao: "Vendedor",
    campos: [
      { name: "vendedorNome", label: "Nome completo", required: true },
      { name: "vendedorDoc", label: "CPF ou CNPJ", required: true },
      { name: "vendedorEndereco", label: "Endereço completo", required: true },
    ],
  },
  {
    secao: "Comprador",
    campos: [
      { name: "compradorNome", label: "Nome completo", required: true },
      { name: "compradorDoc", label: "CPF ou CNPJ", required: true },
      { name: "compradorEndereco", label: "Endereço completo", required: true },
    ],
  },
  {
    secao: "Veículo",
    campos: [
      { name: "veiculoPlaca", label: "Placa", required: true },
      { name: "veiculoMarca", label: "Marca", required: true },
      { name: "veiculoModelo", label: "Modelo", required: true },
      { name: "veiculoAno", label: "Ano (fab./mod.)", required: true },
      { name: "veiculoCor", label: "Cor", required: true },
      { name: "veiculoRenavam", label: "RENAVAM" },
      { name: "veiculoChassi", label: "Chassi" },
    ],
  },
  {
    secao: "Negócio",
    campos: [
      { name: "valorVenda", label: "Valor da venda (R$)", required: true },
      { name: "formaPagamento", label: "Forma de pagamento", required: true },
      { name: "localData", label: "Local e data (ex.: São Paulo, 03/07/2026)", required: true },
    ],
  },
  {
    secao: "Testemunhas",
    campos: [
      { name: "testemunha1Nome", label: "Testemunha 1 — nome", required: true },
      { name: "testemunha1Doc", label: "Testemunha 1 — CPF/CNPJ", required: true },
      { name: "testemunha2Nome", label: "Testemunha 2 — nome", required: true },
      { name: "testemunha2Doc", label: "Testemunha 2 — CPF/CNPJ", required: true },
    ],
  },
];

function estadoInicial(parcial?: Partial<DadosContrato>): DadosContrato {
  return {
    vendedorNome: "",
    vendedorDoc: "",
    vendedorEndereco: "",
    compradorNome: "",
    compradorDoc: "",
    compradorEndereco: "",
    veiculoPlaca: "",
    veiculoMarca: "",
    veiculoModelo: "",
    veiculoAno: "",
    veiculoCor: "",
    veiculoRenavam: "",
    veiculoChassi: "",
    valorVenda: "",
    formaPagamento: "À vista, mediante transferência bancária",
    localData: "",
    testemunha1Nome: "",
    testemunha1Doc: "",
    testemunha2Nome: "",
    testemunha2Doc: "",
    ...parcial,
  };
}

export function ContratoForm({ valoresIniciais }: Props) {
  const [form, setForm] = useState(() => estadoInicial(valoresIniciais));
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar(campo: keyof DadosContrato, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/contrato/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json()) as { erro?: string };
        setErro(data.erro ?? "Erro ao gerar PDF.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrato-${form.veiculoPlaca || "veiculo"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {CAMPOS.map((grupo) => (
        <Card key={grupo.secao}>
          <h2 className="text-lg font-bold text-rp-slate-900">{grupo.secao}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {grupo.campos.map((campo) => (
              <div
                key={campo.name}
                className={campo.name.includes("Endereco") ? "sm:col-span-2" : ""}
              >
                <label htmlFor={campo.name} className="text-sm font-medium text-rp-slate-900">
                  {campo.label}
                </label>
                <Input
                  id={campo.name}
                  required={campo.required}
                  value={form[campo.name] ?? ""}
                  onChange={(e) => atualizar(campo.name, e.target.value)}
                  className="mt-2 normal-case tracking-normal"
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      {erro && (
        <p className="text-sm text-rp-red-500" role="alert">
          {erro}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={carregando}>
        {carregando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando PDF…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Baixar contrato em PDF
          </>
        )}
      </Button>

      <p className="text-center text-xs text-rp-slate-500">
        Modelo gratuito para facilitar a negociação. Não armazenamos os dados
        preenchidos. Revise com advogado antes de assinar.
      </p>
    </form>
  );
}
