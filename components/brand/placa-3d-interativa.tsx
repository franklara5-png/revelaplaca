"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { Placa3D, type Placa3DProps } from "./placa-3d";

/**
 * Envolve a <Placa3D> e faz ela inclinar seguindo o ponteiro.
 *
 * Todo o trabalho visual continua no CSS: aqui so escrevemos --rx/--ry no
 * elemento. Sem isso a placa renderiza reta, que ja e o estado servido pelo
 * servidor — por isso nao ha salto de layout nem dependencia de JS para ver
 * a placa.
 *
 * Ponteiro grosso (dedo) nao entra: em toque a inclinacao brigaria com o
 * scroll e nao ha hover para desfazer.
 */

const MAX_GIRO = 11;

export function Placa3DInterativa(props: Placa3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(false);

  const aplicar = useCallback((rx: number, ry: number) => {
    const objeto = ref.current?.querySelector<HTMLElement>(".rp-objeto-3d");
    if (!objeto) return;
    objeto.style.setProperty("--rx", `${rx}deg`);
    objeto.style.setProperty("--ry", `${ry}deg`);
    objeto.dataset.ativo = rx || ry ? "true" : "false";
  }, []);

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      const alvo = ref.current;
      if (!alvo) return;

      const r = alvo.getBoundingClientRect();
      // -0.5..0.5 a partir do centro do elemento.
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      // Y do ponteiro inclina no eixo X (e vice-versa); o sinal invertido em
      // rotateX faz a placa "olhar" para o cursor em vez de fugir dele.
      aplicar(-py * MAX_GIRO * 2, px * MAX_GIRO * 2);
      setAtivo(true);
    },
    [aplicar],
  );

  const onLeave = useCallback(() => {
    aplicar(0, 0);
    setAtivo(false);
  }, [aplicar]);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-ativo={ativo}
      className="inline-block"
    >
      <Placa3D {...props} />
    </div>
  );
}
