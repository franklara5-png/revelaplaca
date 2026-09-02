// Leitura de user-agent e de endereço de rede: "isto foi gente ou máquina?".
//
// Vive separado de `filtro.ts` porque `filtro.ts` é o filtro de ROTA, que roda
// também no client (VisitTracker). Aqui é a classificação do VISITANTE, e o
// que ela sabe — lista de datacenter, forma como o país foi gravado — só faz
// sentido no servidor, que é quem vê cabeçalho e IP.
//
// Tudo aqui é função pura: nada toca banco, cabeçalho ou relógio. É de
// propósito — a leitura (`lib/hermes/gente.ts`) precisa das MESMAS listas para
// reavaliar linha já gravada, e lista copiada é lista que desanda.

/** Trechos de user-agent que identificam rastreador conhecido. */
export const MARCAS_DE_BOT = [
  "bot",
  // Rastreadores do Google que NÃO trazem "bot" no user-agent — vistos em
  // produção nos sites irmãos entrando como visitante. "contém bot" não basta.
  "googleother",
  "google-inspectiontool",
  "google-read-aloud",
  "googleweblight",
  "chrome-lighthouse",
  "lighthouse",
  "bytespider",
  "facebookcatalog",
  "facebookexternalhit",
  "crawler",
  "spider",
  "slurp",
  "ia_archiver",
  "headlesschrome",
  "python-requests",
  "curl/",
  "wget/",
  "go-http-client",
  "node-fetch",
  "axios",
  "pingdom",
  "uptimerobot",
] as const;

export function pareceBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // sem UA nenhum: trata como não-humano
  const ua = userAgent.toLowerCase();
  return MARCAS_DE_BOT.some((marca) => ua.includes(marca));
}

/**
 * Cidades quase inteiramente ocupadas por datacenter de nuvem — não "cidade
 * grande que também tem datacenter" (essas ficam de fora: o risco de marcar
 * gente real como rastreador é alto demais). A Vercel não manda ASN nem
 * provedor no cabeçalho de geolocalização, só localização — então isto é o que
 * dá para inferir sem depender de serviço externo.
 *
 * Formato da chave: `PAIS|REGIAO|Cidade`, com PAIS em ISO. Região vazia vale
 * como "qualquer região" — a Vercel nem sempre manda o código da região, e
 * entrada que só casa com região preenchida não serve para nada justamente nos
 * registros que motivaram a lista.
 */
export const CIDADES_DATACENTER = [
  "US|VA|Ashburn",
  "US|VA|Reston",
  "US|VA|Sterling",
  "US|OR|Boardman",
  "US|OR|The Dalles",
  "US|IA|Council Bluffs",
  "US|NJ|North Bergen",
  // Onde caem os varredores de porta que se declaram navegador.
  "US|NY|Nanuet",
  "CA|QC|Beauharnois",
  // Vila de ~4.500 habitantes onde fica o parque de servidores da Hetzner.
  "DE||Falkenstein",
] as const;

/**
 * O país NÃO é gravado em ISO nesta tabela.
 *
 * `app/api/track/visit/route.ts` passa o cabeçalho `x-vercel-ip-country` por
 * `Intl.DisplayNames("pt-BR")` antes de gravar: o banco tem "Estados Unidos",
 * "Alemanha", "Brasil" — e "US"/"DE"/"BR" só nas linhas em que a conversão
 * falhou (a rota cai de volta no ISO). Comparar contra uma lista só em ISO
 * deixaria a regra inteira passando batido.
 *
 * Então cada país é comparado em todas as grafias possíveis. O nome vem do
 * mesmo `Intl` que a escrita usa (para bater exatamente com o que foi gravado)
 * e também de uma tabela fixa, que cobre o caso de o ICU do runtime que gravou
 * não ser o mesmo que o do runtime que lê. O nome em inglês está na tabela
 * porque Node compilado com small-icu não tem os dados de pt-BR e devolve
 * "United States" — a gravação vira inglês sem ninguém pedir.
 */
const NOMES_FIXOS_DO_PAIS: Record<string, string[]> = {
  US: ["Estados Unidos", "United States"],
  CA: ["Canadá", "Canada"],
  DE: ["Alemanha", "Germany"],
  BR: ["Brasil", "Brazil"],
};

const nomesPt = (() => {
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" });
  } catch {
    return null;
  }
})();

/** ISO e nome: todas as grafias sob as quais o país pode ter sido gravado. */
export function formasDoPais(iso: string): string[] {
  const formas = new Set<string>([iso, ...(NOMES_FIXOS_DO_PAIS[iso] ?? [])]);
  try {
    const doIntl = nomesPt?.of(iso);
    if (doIntl) formas.add(doIntl);
  } catch {
    // ICU sem a região: o ISO e a tabela fixa já cobrem.
  }
  return [...formas];
}

/** Como "Brasil" pode aparecer na coluna `country`. */
export const FORMAS_DE_BRASIL = formasDoPais("BR");

/**
 * As chaves de `CIDADES_DATACENTER` expandidas para todas as grafias de país.
 * Exportada porque a leitura compara a mesma chave dentro do SQL — ver
 * `lib/hermes/gente.ts`.
 */
export const CHAVES_DATACENTER: string[] = CIDADES_DATACENTER.flatMap(
  (chave) => {
    const [iso, regiao, cidade] = chave.split("|");
    return formasDoPais(iso).map((pais) => `${pais}|${regiao}|${cidade}`);
  },
);

const CHAVES_DATACENTER_SET: ReadonlySet<string> = new Set(CHAVES_DATACENTER);

export function pareceDatacenter(
  cidade: string | null | undefined,
  regiao: string | null | undefined,
  pais: string | null | undefined,
): boolean {
  if (!cidade || !pais) return false;
  return (
    CHAVES_DATACENTER_SET.has(`${pais}|${regiao ?? ""}|${cidade}`) ||
    CHAVES_DATACENTER_SET.has(`${pais}||${cidade}`)
  );
}

/**
 * Acesso de fora do Brasil que chegou sem cidade nenhuma.
 *
 * A Vercel resolve cidade para acesso residencial normal — operadora de banda
 * larga e de celular estão nas bases de geolocalização. Faixa de datacenter e
 * de trânsito, não: sobra o país e mais nada. Então país estrangeiro somado a
 * cidade vazia é assinatura de máquina, e `pareceDatacenter` não alcança esse
 * caso, porque ela precisa da cidade para ter o que comparar.
 *
 * O corte para no Brasil de propósito: visitante brasileiro sem cidade existe
 * (CGNAT de operadora móvel, faixa recém-alocada) e o público deste site é
 * brasileiro — ali o benefício da dúvida vale a pena.
 */
export function pareceEstrangeiroSemCidade(
  cidade: string | null | undefined,
  pais: string | null | undefined,
): boolean {
  if (!pais) return false;
  if (FORMAS_DE_BRASIL.includes(pais)) return false;
  return !cidade?.trim();
}

/** Endereço de rede privada ou local — visita minha, não de visitante. */
export function ehEnderecoLocal(ip: string | null | undefined): boolean {
  if (!ip) return false;
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}
