const PLACA_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export function normalizarPlaca(placa: string): string {
  return placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function validarPlaca(placa: string): boolean {
  return PLACA_REGEX.test(normalizarPlaca(placa));
}

export function formatarPlaca(placa: string): string {
  const n = normalizarPlaca(placa);
  if (n.length !== 7) return n;
  return `${n.slice(0, 3)}-${n.slice(3)}`;
}
