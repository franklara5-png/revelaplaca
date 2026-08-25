// Filtro compartilhado entre o VisitTracker (client) e a rota /api/track/visit
// (server, defesa em profundidade). Sem "server-only": roda nos dois lados.

// Rotas privadas/técnicas — nunca rastreadas: admin, painel do cliente, auth,
// api, internals do Next e arquivos estáticos.
const ROTA_PRIVADA_OU_TECNICA =
  /^\/(admin|painel|login|api|_next|checkout)(\/|$)/;

const ARQUIVO_ESTATICO = /\.[a-zA-Z0-9]{2,5}$/;

export function isRotaPublica(path: string): boolean {
  if (!path || !path.startsWith("/")) return false;
  if (ROTA_PRIVADA_OU_TECNICA.test(path)) return false;
  if (ARQUIVO_ESTATICO.test(path)) return false;
  return true;
}

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|curl|wget|python-requests|axios|headlesschrome|phantomjs|lighthouse|pingdom|uptimerobot|vercel-cron/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // sem UA nenhum: trata como não-humano
  return BOT_UA.test(userAgent);
}
