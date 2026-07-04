import { CtaRelatorioLink } from "@/components/consulta/cta-relatorio-link";

type Props = {
  placa: string;
};

export function ConsultaCtaMobile({ placa }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rp-slate-100 bg-white/95 p-4 backdrop-blur-md sm:hidden">
      <CtaRelatorioLink
        placa={placa}
        href={`/checkout/${placa}`}
        className="flex h-12 w-full items-center justify-center rounded-full bg-rp-primary-900 text-sm font-semibold text-white shadow-lg"
      >
        Ver relatório completo — R$ 24,90 no Pix
      </CtaRelatorioLink>
    </div>
  );
}
