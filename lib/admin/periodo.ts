export type PeriodoAdmin = "hoje" | "7d" | "30d";

export function parsePeriodo(valor?: string): PeriodoAdmin {
  if (valor === "hoje" || valor === "7d" || valor === "30d") return valor;
  return "7d";
}

export function inicioDoPeriodo(periodo: PeriodoAdmin): Date {
  const agora = new Date();
  if (periodo === "hoje") {
    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  }
  const dias = periodo === "7d" ? 7 : 30;
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

export function diasGrafico(): Date[] {
  const dias: Date[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dias.push(d);
  }
  return dias;
}

export function labelDia(data: Date): string {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
