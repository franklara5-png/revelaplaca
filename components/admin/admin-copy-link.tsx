"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  url: string;
};

export function AdminCopyLink({ url }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex items-center gap-1 text-xs font-semibold text-rp-primary hover:underline"
    >
      {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      Copiar link
    </button>
  );
}
