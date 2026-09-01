import { cn } from "@/lib/utils";
import { formatarPlaca } from "@/lib/placa";

/**
 * Placa Mercosul em CSS 3D.
 *
 * Server component de proposito: o hero e o LCP da home, entao a placa precisa
 * sair pronta do servidor. O giro com o cursor e enriquecimento opcional e vem
 * do <Placa3DInterativa>, que so escreve --rx/--ry por cima deste mesmo HTML.
 *
 * A espessura e feita com uma camada irma deslocada em translateZ negativo,
 * nao com box-shadow: assim ela gira junto e a lateral aparece de verdade
 * quando a placa inclina.
 */

export type Placa3DSize = "sm" | "md" | "lg";

const SIZES: Record<
  Placa3DSize,
  { largura: string; tarja: string; texto: string; pais: string; brasil: string }
> = {
  sm: {
    largura: "w-[168px]",
    tarja: "h-[15px]",
    texto: "text-[26px] tracking-[0.09em]",
    pais: "text-[9px]",
    brasil: "text-[7px] tracking-[0.18em]",
  },
  md: {
    largura: "w-[248px]",
    tarja: "h-[22px]",
    texto: "text-[40px] tracking-[0.09em]",
    pais: "text-[13px]",
    brasil: "text-[10px] tracking-[0.18em]",
  },
  lg: {
    largura: "w-[320px] sm:w-[380px]",
    tarja: "h-[26px] sm:h-[30px]",
    texto: "text-[52px] sm:text-[62px] tracking-[0.09em]",
    pais: "text-[16px] sm:text-[19px]",
    brasil: "text-[11px] sm:text-[13px] tracking-[0.18em]",
  },
};

export type Placa3DProps = {
  /** Placa crua ou formatada. Vazio mostra o gabarito de digitacao. */
  placa?: string;
  size?: Placa3DSize;
  className?: string;
  /** Sombra projetada no chao. Desligue quando a placa fica sobre fundo escuro. */
  sombra?: boolean;
};

export function Placa3D({
  placa = "",
  size = "md",
  className,
  sombra = true,
}: Placa3DProps) {
  const s = SIZES[size];
  const limpa = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
  const exibida = limpa.length === 7 ? formatarPlaca(limpa) : limpa;
  const vazia = exibida.length === 0;

  return (
    <div className={cn("rp-cena-3d inline-block", className)}>
      <div className="relative">
        {/* Sombra no chao. Fica fora do preserve-3d para nao girar com a placa. */}
        {sombra && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3 -bottom-3 h-6 rounded-[50%] bg-rp-slate-900/25 blur-lg"
          />
        )}

        <div
          className={cn(
            "rp-objeto-3d relative rounded-[9px]",
            s.largura,
          )}
        >
          {/* Corpo extrudado: mesma silhueta empurrada para tras. E o que vira
              lateral visivel quando a placa inclina. */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[9px] bg-rp-slate-900"
            style={{ transform: `translateZ(calc(var(--rp-placa-espessura) * -1))` }}
          />

          {/* Face frontal */}
          <div
            className="relative overflow-hidden rounded-[9px] border-[3px] p-[3px]"
            style={{
              borderColor: "rgb(var(--rp-placa-borda))",
              background: "rgb(var(--rp-placa-corpo))",
              boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.9)",
            }}
          >
            {/* Tarja azul Mercosul */}
            <div
              className={cn(
                "flex items-center justify-between rounded-t-[5px] px-2",
                s.tarja,
              )}
              style={{ background: "rgb(var(--rp-placa-azul))" }}
            >
              <span
                aria-hidden
                className="inline-block h-[60%] w-[14px] rounded-[2px] bg-[linear-gradient(180deg,#2e7d32_0_50%,#f9fafb_50%_100%)] opacity-90"
              />
              <span
                className={cn("font-bold text-white/95", s.brasil)}
                style={{ fontFamily: "var(--font-sans), sans-serif" }}
              >
                BRASIL
              </span>
              <span className={cn("font-extrabold text-white", s.pais)}>BR</span>
            </div>

            {/* Caracteres */}
            <div
              className={cn(
                "flex items-center justify-center py-1 font-extrabold tabular-nums",
                s.texto,
                vazia && "text-rp-slate-400/40",
              )}
              style={{
                fontFamily:
                  "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
                color: vazia ? undefined : "rgb(var(--rp-placa-borda))",
              }}
            >
              {vazia ? "ABC0D00" : exibida}
            </div>

            {/* Brilho especular. Percorre a face conforme a inclinacao. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.55) 46%, transparent 62%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
