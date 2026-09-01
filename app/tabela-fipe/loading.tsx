/**
 * Esqueleto das paginas de FIPE.
 *
 * Vale para /tabela-fipe e para os filhos dinamicos ([marca] e [modelo]) — um
 * loading.tsx no segmento envolve tambem o que esta abaixo dele. As duas
 * paginas de marca e modelo consultam o banco a cada visita fora do cache.
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
      <span className="sr-only">Carregando os preços da tabela FIPE…</span>

      <div className="mx-auto max-w-5xl">
        <Bloco className="h-4 w-56" />
        <Bloco className="mt-6 h-9 w-full max-w-md" />
        <Bloco className="mt-5 h-4 w-full max-w-2xl" />
        <Bloco className="mt-2 h-4 w-full max-w-xl" />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Bloco className="h-24 w-full rounded-[18px]" />
          <Bloco className="h-24 w-full rounded-[18px]" />
          <Bloco className="h-24 w-full rounded-[18px]" />
        </div>

        <Bloco className="mt-8 h-80 w-full rounded-[18px]" />
      </div>
    </div>
  );
}
