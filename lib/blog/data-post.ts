/**
 * Formata a data de publicacao de um post.
 *
 * O `timeZone: "UTC"` nao e detalhe: o frontmatter traz uma data de calendario
 * ("2026-03-01"), sem hora. O `new Date` interpreta isso como meia-noite UTC e,
 * formatado no fuso de Brasilia (UTC-3), o resultado retrocede para as 21h do
 * dia anterior — a tela mostrava "28 de fevereiro" para um post datado
 * 1o de marco. Valia para TODOS os posts, na listagem e no cabecalho.
 *
 * Fixar UTC trata a string como o que ela e: um dia, nao um instante.
 *
 * Fica aqui, e nao duplicada nos componentes, porque foi exatamente a
 * duplicacao (post-card e post-header, cada um com sua copia) que deixou o
 * defeito passar despercebido nos dois lugares ao mesmo tempo.
 */
export function formatarDataPost(
  date: string,
  mes: "long" | "short" = "long",
): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: mes,
    year: "numeric",
    timeZone: "UTC",
  });
}
