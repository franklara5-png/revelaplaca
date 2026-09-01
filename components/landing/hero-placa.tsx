"use client";

import { useState } from "react";
import { Placa3DInterativa } from "@/components/brand";
import { PlacaSearchForm } from "./placa-search-form";

/**
 * Placa 3D do hero + campo de busca, juntos porque compartilham o texto:
 * o que o visitante digita aparece na placa em tempo real.
 *
 * A placa e decorativa — quem anuncia o conteudo e o <h1> logo acima e o
 * proprio input. Por isso aria-hidden: um leitor de tela ouviria a placa
 * repetindo, caractere a caractere, o que a pessoa acabou de digitar.
 */
export function HeroPlaca() {
  const [placa, setPlaca] = useState("");

  return (
    <div className="flex flex-col items-center">
      <div aria-hidden className="mb-10">
        <Placa3DInterativa placa={placa} size="lg" />
      </div>

      <div className="flex w-full justify-center">
        <PlacaSearchForm id="consultar" onPlacaChange={setPlaca} />
      </div>
    </div>
  );
}
