"use client";

import { useEffect } from "react";

/**
 * Ultimo recurso: erro dentro do proprio layout raiz, onde o error.tsx normal
 * nao chega. Substitui <html> e <body> inteiros, entao nao pode depender de
 * nada do layout — nem da fonte, nem dos tokens do globals.css. Por isso o
 * estilo aqui e inline e propositalmente feio.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            O RevelaPlaca saiu do ar por um instante
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            Foi uma falha nossa. Recarregue a página — se continuar, tente de
            novo em alguns minutos.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "#0d545d",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: "2rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}
            >
              código: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
