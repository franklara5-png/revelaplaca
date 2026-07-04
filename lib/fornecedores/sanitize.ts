const CAMPOS_PROPRIETARIO = new Set([
  "nome",
  "name",
  "proprietario",
  "proprietário",
  "owner",
  "cpf",
  "cnpj",
  "documento",
  "document",
  "endereco",
  "endereço",
  "address",
  "logradouro",
  "bairro",
  "cep",
  "telefone",
  "phone",
  "email",
  "rg",
]);

function chaveSuspeita(chave: string): boolean {
  const k = chave.toLowerCase();
  if (CAMPOS_PROPRIETARIO.has(k)) return true;
  if (k.includes("propriet")) return true;
  if (k.includes("owner")) return true;
  if (k.includes("cpf") || k.includes("cnpj")) return true;
  if (k.includes("endereco") || k.includes("endereço") || k.includes("address"))
    return true;
  return false;
}

export function sanitizarDados<T>(valor: T): T {
  if (valor === null || valor === undefined) return valor;
  if (Array.isArray(valor)) {
    return valor.map((item) => sanitizarDados(item)) as T;
  }
  if (typeof valor === "object") {
    const resultado: Record<string, unknown> = {};
    for (const [chave, conteudo] of Object.entries(
      valor as Record<string, unknown>,
    )) {
      if (chaveSuspeita(chave)) continue;
      resultado[chave] = sanitizarDados(conteudo);
    }
    return resultado as T;
  }
  return valor;
}
