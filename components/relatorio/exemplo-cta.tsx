import { PlacaSearchForm } from "@/components/landing/placa-search-form";
import { Card } from "@/components/ui";

export function ExemploCta() {
  return (
    <Card className="bg-rp-primary-50 border-rp-primary-100 text-center">
      <h2 className="text-lg font-bold text-rp-primary-900">
        Revele a placa do seu veículo
      </h2>
      <p className="mt-2 text-sm text-rp-slate-600">
        Consulta básica grátis — relatório completo por R$ 24,90.
      </p>
      <div className="mt-6 flex justify-center">
        <PlacaSearchForm />
      </div>
    </Card>
  );
}
