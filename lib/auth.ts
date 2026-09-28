import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import {
  emailRedefinirSenha,
  emailVerificarEndereco,
} from "@/lib/email-templates/conta";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  // Cadastro com e-mail e senha, ao lado do Google.
  //
  // requireEmailVerification NAO e refinamento: o painel encontra pedidos por
  // user_id OU e-mail, entao um cadastro nao verificado deixaria qualquer um
  // se registrar com o endereco de outra pessoa e ver os laudos pagos dela,
  // com link de acesso e tudo. Enquanto o e-mail nao for confirmado, nao ha
  // sessao.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const corpo = emailRedefinirSenha(url, user.name);
      await sendEmail({ to: user.email, ...corpo });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const corpo = emailVerificarEndereco(url, user.name);
      await sendEmail({ to: user.email, ...corpo });
    },
  },

  // Mesma pessoa, duas portas: quem entrou com o Google e depois cadastra
  // senha no mesmo endereco cai na MESMA conta, em vez de criar uma segunda
  // conta com o mesmo e-mail e perder o historico de pedidos. So o Google
  // entra na lista: ele verifica o endereco na origem.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type AuthSession = typeof auth.$Infer.Session;
