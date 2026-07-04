"use client";

import { useEffect, useRef } from "react";
import { enviarEventoCliente } from "@/components/analytics/track-evento";

type Props = {
  placa: string;
};

export function CheckoutViewTracker({ placa }: Props) {
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    void enviarEventoCliente("checkout_view", placa);
  }, [placa]);

  return null;
}
