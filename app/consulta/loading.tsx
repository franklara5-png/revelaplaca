/**
 * Esqueleto da consulta de placa.
 *
 * Rota dinamica que bate no Neon — e no plano free o banco dorme e leva um
 * tempo para acordar. Sem isto a pagina ficava em branco ate responder, sem
 * nenhum sinal de que algo estava acontecendo.
 *
 * motion-safe: quem pediu menos movimento recebe o mesmo bloco, parado.
 */
function Bloco({ className }: { className: string }) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded-lg bg-rp-slate-100 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="px-4 pb-20 pt-28" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando a consulta da placa…</span>

      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <Bloco className="h-4 w-40" />
        <Bloco className="mt-6 h-[110px] w-[248px] rounded-[9px]" />
        <Bloco className="mt-8 h-9 w-64" />
        <Bloco className="mt-4 h-4 w-full max-w-md" />
        <Bloco className="mt-2 h-4 w-full max-w-sm" />
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <Bloco className="h-64 w-full rounded-[18px]" />
      </div>
    </div>
  );
}
