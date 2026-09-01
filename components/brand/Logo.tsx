import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-url";

type Props = {
  variant?: "full" | "icon";
  className?: string;
  textClassName?: string;
};

/**
 * Marca RevelaPlaca — "metade revelada".
 *
 * A placa partida ao meio: a esquerda e o que o anuncio mostra (dois blocos de
 * caractere), a direita e o bloco solido do que estava escondido.
 *
 * Desenhada so com formas solidas, sem opacidade empilhada e sem clipPath. Isso
 * e o que faz ela sobreviver a 16px de favicon e a preto e branco — e, de
 * quebra, elimina o id duplicado no DOM que a versao anterior criava por
 * renderizar no header e no rodape da mesma pagina.
 *
 * Geometria de referencia num canvas 64x64: a placa ocupa x 3..61, y 18..46
 * (proporcao ~2:1, contra 1,4:1 da versao antiga). O viewBox abaixo e esse
 * retangulo recortado, para o simbolo nao carregar respiro vertical inutil
 * quando fica ao lado do texto.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="3 17 58 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-[54px] shrink-0", className)}
      aria-hidden
    >
      {/* metade revelada */}
      <path
        d="M32 22h20.5a4.5 4.5 0 0 1 4.5 4.5v11a4.5 4.5 0 0 1-4.5 4.5H32z"
        fill="currentColor"
      />
      {/* corpo da placa */}
      <rect
        x="5"
        y="20"
        width="54"
        height="24"
        rx="6"
        stroke="currentColor"
        strokeWidth="4"
      />
      {/* o que o anuncio mostra */}
      <rect x="13" y="29" width="13" height="4" rx="2" fill="currentColor" />
      <rect x="13" y="36" width="9" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ variant = "full", className, textClassName }: Props) {
  if (variant === "icon") {
    return <LogoIcon className={className} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon className="text-rp-primary" />
      <span className={cn("font-bold tracking-tight text-rp-ink", textClassName)}>
        {SITE_NAME}
      </span>
    </span>
  );
}
