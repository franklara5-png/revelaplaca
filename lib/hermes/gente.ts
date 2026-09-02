import { and, isNotNull, not, notInArray, or, sql, type SQL } from "drizzle-orm";
import { siteVisits } from "@/db/schema";
import {
  CHAVES_DATACENTER,
  FORMAS_DE_BRASIL,
  MARCAS_DE_BOT,
} from "@/lib/track/agente";

/**
 * "Isto foi gente" escrito como condição de consulta.
 *
 * `site_visits` não guarda veredito nenhum: a linha entra ou não entra, e o
 * critério do momento da gravação fica congelado na linha. Quando a regra
 * melhora — foi o que acabou de acontecer — as linhas antigas continuam no
 * banco e seguem aparecendo no card "IPs do dia" com IP de datacenter.
 *
 * Reclassificar com UPDATE resolveria uma vez só, criaria o mesmo problema na
 * próxima regra e ainda reescreveria histórico de produção. Então a decisão é
 * avaliar user-agent, país e cidade na hora da LEITURA: a escrita para de sujar
 * daqui pra frente, e isto aqui limpa a tela hoje.
 *
 * Espelha `pareceBot`, `pareceDatacenter` e `pareceEstrangeiroSemCidade` de
 * `lib/track/agente.ts` — as duas versões precisam andar juntas, e é por isso
 * que as listas vêm de lá em vez de serem copiadas.
 */

/**
 * Contém a marca, com a mesma semântica do `includes` do TypeScript.
 *
 * `strpos` e não `like '%marca%'` de propósito: `ia_archiver` tem `_`, que em
 * LIKE é curinga de um caractere qualquer. Aqui a busca é literal, sem escape
 * para esquecer depois.
 */
function contemMarca(marca: string): SQL {
  return sql`strpos(lower(coalesce(${siteVisits.userAgent}, '')), ${marca}) > 0`;
}

/** Sem user-agent, ou com marca de rastreador conhecido — ver `pareceBot`. */
const E_BOT = or(
  sql`coalesce(btrim(${siteVisits.userAgent}), '') = ''`,
  ...MARCAS_DE_BOT.map(contemMarca),
) as SQL;

/** `PAIS|REGIAO|Cidade` da linha, para comparar com a lista de cidades. */
const CHAVE_DE_LOCAL = sql`(
  coalesce(${siteVisits.country}, '') || '|' ||
  coalesce(${siteVisits.region}, '') || '|' ||
  coalesce(${siteVisits.city}, '')
)`;

/** Mesma chave sem a região, para as entradas que valem em qualquer uma. */
const CHAVE_SEM_REGIAO = sql`(
  coalesce(${siteVisits.country}, '') || '||' || coalesce(${siteVisits.city}, '')
)`;

// `CHAVES_DATACENTER` já vem com o país nas duas grafias (ISO e nome em
// pt-BR), porque é assim que a coluna `country` foi gravada. Ver `agente.ts`.
const COM_REGIAO = CHAVES_DATACENTER.filter((c) => c.split("|")[1] !== "");
const SEM_REGIAO = CHAVES_DATACENTER.filter((c) => c.split("|")[1] === "");

/** País estrangeiro e cidade vazia — ver `pareceEstrangeiroSemCidade`. */
const ESTRANGEIRO_SEM_CIDADE = and(
  isNotNull(siteVisits.country),
  sql`btrim(${siteVisits.country}) <> ''`,
  notInArray(siteVisits.country, FORMAS_DE_BRASIL),
  sql`coalesce(btrim(${siteVisits.city}), '') = ''`,
) as SQL;

/**
 * Condição para as contagens e listagens de visitante: não é rastreador
 * conhecido, não veio de cidade de datacenter e não é estrangeiro sem cidade.
 */
export const E_GENTE: SQL = and(
  not(E_BOT),
  not(ESTRANGEIRO_SEM_CIDADE),
  ...(COM_REGIAO.length > 0 ? [notInArray(CHAVE_DE_LOCAL, COM_REGIAO)] : []),
  ...(SEM_REGIAO.length > 0 ? [notInArray(CHAVE_SEM_REGIAO, SEM_REGIAO)] : []),
) as SQL;
