import Link from "next/link";
import { PlacaSearchForm } from "@/components/landing/placa-search-form";
import { Card } from "@/components/ui";

type Props = {
  marca: string;
  modelo: string;
};

export function FipeConsultaCta({ marca, modelo }: Props) {
  return (
    <Card className="bg-rp-primary-50 border-rp-primary-100">
      <h2 className="text-lg font-bold text-rp-primary-900">
        Revele uma placa de {modelo}
      </h2>
      <p className="mt-2 text-sm text-rp-slate-600">
        Digite a placa de um {marca} {modelo} e veja dados básicos grátis — ou
        adquira o relatório completo com histórico de leilão, sinistro e
        restrições no RevelaPlaca.
      </p>
      <div className="mt-6">
        <PlacaSearchForm />
      </div>
      <p className="mt-4 text-center text-sm text-rp-slate-600">
        Ainda não tem a placa?{" "}
        <Link href="/" className="font-semibold text-rp-primary-700 hover:underline">
          Consultar outro veículo
        </Link>
      </p>
    </Card>
  );
}
