import "server-only";

const SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const PRODUCTION_URL = "https://api.asaas.com/v3";

type AsaasCustomer = {
  id: string;
  email?: string;
  name?: string;
};

type AsaasPayment = {
  id: string;
  status: string;
  invoiceUrl?: string;
  externalReference?: string;
  billingType?: string;
};

type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

type AsaasList<T> = {
  data: T[];
};

function baseUrl(): string {
  return process.env.ASAAS_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

function apiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return key;
}

async function asaasFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey(),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const texto = await res.text();
    console.error(`[asaas] ${path} → HTTP ${res.status}:`, texto);
    throw new Error(`Asaas HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function buscarClientePorEmail(
  email: string,
): Promise<AsaasCustomer | null> {
  const res = await asaasFetch<AsaasList<AsaasCustomer>>(
    `/customers?email=${encodeURIComponent(email)}&limit=1`,
  );
  return res.data[0] ?? null;
}

export async function criarCliente(email: string): Promise<AsaasCustomer> {
  const existente = await buscarClientePorEmail(email);
  if (existente) return existente;

  const nome = email.split("@")[0]?.replace(/[._-]/g, " ") || "Cliente";

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: nome.slice(0, 80),
      email,
      notificationDisabled: true,
    }),
  });
}

function dataVencimentoHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function criarPagamento(input: {
  customerId: string;
  valorReais: number;
  externalReference: string;
  descricao: string;
  billingType: "PIX" | "CREDIT_CARD";
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType,
      value: input.valorReais,
      dueDate: dataVencimentoHoje(),
      externalReference: input.externalReference,
      description: input.descricao,
    }),
  });
}

export async function buscarPixQrCode(
  paymentId: string,
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function buscarPagamento(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}

export function pagamentoConfirmado(status: string): boolean {
  return ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status);
}

export type WebhookPayload = {
  event: string;
  payment?: AsaasPayment;
};

export function extrairPagamentoWebhook(
  body: WebhookPayload,
): AsaasPayment | null {
  if (!body.payment?.id) return null;
  return body.payment;
}

export function eventoPagamentoConfirmado(event: string): boolean {
  return event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED";
}

const PAINEL_SANDBOX = "https://sandbox.asaas.com";
const PAINEL_PROD = "https://www.asaas.com";

export function urlPainelAsaas(paymentId: string): string {
  const base =
    process.env.ASAAS_ENV === "production" ? PAINEL_PROD : PAINEL_SANDBOX;
  return `${base}/payment/show/${paymentId}`;
}

export function pagamentoExpirado(status: string): boolean {
  return ["OVERDUE", "CANCELLED", "REFUNDED", "DELETED"].includes(status);
}
