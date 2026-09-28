import { createAuthClient } from "better-auth/react";

// Sem baseURL de proposito: os dois consumidores sao "use client", entao o
// better-auth cai em "/api/auth" relativo — sempre a origem de quem clicou.
// Fixar NEXT_PUBLIC_APP_URL aqui embutia no bundle o valor do BUILD: se a env
// de producao estiver com o valor de desenvolvimento, login e logout passam a
// apontar pra fora do site.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession, getSession } = authClient;
