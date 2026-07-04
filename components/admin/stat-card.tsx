import { Card } from "@/components/ui";

type Props = {
  titulo: string;
  valor: string;
  subtitulo?: string;
};

export function StatCard({ titulo, valor, subtitulo }: Props) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
        {titulo}
      </p>
      <p className="mt-2 text-2xl font-bold text-rp-ink">{valor}</p>
      {subtitulo && (
        <p className="mt-1 text-xs text-rp-slate-600">{subtitulo}</p>
      )}
    </Card>
  );
}
