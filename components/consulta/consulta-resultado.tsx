import Link from "next/link";
import { formatarPlaca } from "@/lib/placa";
import {
  formatarValorFipe,
  slugify,
  type VeiculoCache,
} from "@/lib/veiculos";
import type { ConsultaBasica } from "@/lib/fornecedores/types";
import { Card } from "@/components/ui";
import { IndiceRisco } from "./indice-risco";
import { ComparadorFipe } from "./comparador-fipe";

type Props = {
  placa: string;
  dados: ConsultaBasica;
  outrosModelo?: VeiculoCache[];
};

function FichaItem({
  label,
  valor,
}: {
  label: string;
  valor: string | number | null | undefined;
}) {
  const exibir = valor === null || valor === undefined || valor === "" ? "—" : valor;
  return (
    <div className="rounded-2xl border border-rp-slate-100 bg-rp-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-rp-slate-900">{exibir}</dd>
    </div>
  );
}

export function ConsultaResultado({ placa, dados, outrosModelo = [] }: Props) {
  const ano =
    dados.anoModelo ?? dados.anoFabricacao
      ? [dados.anoFabricacao, dados.anoModelo].filter(Boolean).join("/")
      : null;

  const fipeSlug =
    dados.marca && dados.modelo
      ? `/tabela-fipe/${slugify(dados.marca)}/${slugify(dados.modelo)}`
      : null;

  return (
    <div className="space-y-6 pb-24">
      <Card className="overflow-hidden p-0">
        <div className="bg-rp-primary-900 px-6 py-8 text-white">
          <p className="text-sm font-medium text-rp-primary-100">Placa consultada</p>
          <h1 className="mt-1 text-3xl font-black tracking-widest md:text-4xl">
            {formatarPlaca(placa)}
          </h1>
          <p className="mt-3 text-lg font-semibold">
            {[dados.marca, dados.modelo, ano].filter(Boolean).join(" · ") ||
              "Veículo identificado"}
          </p>
          {dados.versao && (
            <p className="mt-1 text-sm text-rp-primary-100">{dados.versao}</p>
          )}
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <FichaItem label="Ano fab./mod." valor={ano} />
          <FichaItem label="Cor" valor={dados.cor} />
          <FichaItem label="Combustível" valor={dados.combustivel} />
          <FichaItem
            label="Município/UF"
            valor={
              dados.municipio || dados.uf
                ? [dados.municipio, dados.uf].filter(Boolean).join(" — ")
                : null
            }
          />
          <FichaItem label="Segmento" valor={dados.segmento} />
          <FichaItem label="Chassi (parcial)" valor={dados.chassiParcial} />
        </div>
      </Card>

      <Card>
        <p className="rp-section-eyebrow">Tabela FIPE</p>
        <p className="mt-2 text-3xl font-bold text-rp-primary-900">
          {formatarValorFipe(dados.fipeValor)}
        </p>
        {dados.fipeReferencia && (
          <p className="mt-1 text-sm text-rp-slate-600">
            Referência: {dados.fipeReferencia}
          </p>
        )}
        {fipeSlug && (
          <Link
            href={fipeSlug}
            className="mt-4 inline-block text-sm font-semibold text-rp-primary-700 hover:underline"
          >
            Ver preços FIPE do {dados.modelo} →
          </Link>
        )}
      </Card>

      <ComparadorFipe placa={placa} fipeValor={dados.fipeValor} />

      <IndiceRisco placa={placa} dados={dados} />

      {outrosModelo.length > 0 && dados.modelo && (
        <Card>
          <h2 className="text-lg font-bold text-rp-slate-900">
            Outros {dados.modelo} já consultados
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {outrosModelo.map((v) => (
              <li key={v.placa}>
                <Link
                  href={`/consulta/${v.placa}`}
                  className="inline-flex rounded-full border border-rp-slate-100 bg-rp-slate-50 px-3 py-1.5 text-sm font-medium text-rp-slate-700 hover:border-rp-primary-200 hover:text-rp-primary-900"
                >
                  {formatarPlaca(v.placa)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-center text-sm text-rp-slate-600">
        Vai fechar negócio?{" "}
        <Link
          href={`/contrato-compra-venda-veiculo?placa=${placa}`}
          className="font-semibold text-rp-primary-700 hover:underline"
        >
          Gerar contrato de compra e venda em PDF
        </Link>
      </p>
    </div>
  );
}
