import Link from "next/link";
import { Section } from "@/components/ui";
import { MARCAS_POPULARES } from "@/lib/constants/marcas-populares";
import { listarMarcas } from "@/lib/fipe";

// A home tinha 12 links internos, nenhum para o blog nem para a tabela FIPE.
// Os temas abaixo são os que mais aparecem no Search Console (02/10/2026):
// leilão e renavam lideram as impressões.
const GUIAS = [
  {
    href: "/blog/como-saber-se-carro-foi-leilao",
    titulo: "Como saber se o carro é de leilão",
    resumo: "Os sinais que entregam um carro de leilão e por que ele vale menos.",
  },
  {
    href: "/blog/como-descobrir-o-renavam-pela-placa",
    titulo: "Como descobrir o Renavam pela placa",
    resumo: "Onde encontrar o número e para que ele serve na compra.",
  },
  {
    href: "/blog/consultar-debitos-do-veiculo-por-placa",
    titulo: "Consultar débitos do veículo pela placa",
    resumo: "IPVA, multas e licenciamento: o que fica com quem compra.",
  },
  {
    href: "/blog/restricoes-no-veiculo-o-que-significam",
    titulo: "Restrições no veículo: o que significam",
    resumo: "Gravame, Renajud e bloqueios que travam a transferência.",
  },
  {
    href: "/blog/como-saber-se-carro-e-roubado",
    titulo: "Como saber se um carro é roubado",
    resumo: "Como checar registro de roubo e furto antes de pagar.",
  },
  {
    href: "/blog/o-que-verificar-antes-de-comprar-carro-usado",
    titulo: "O que verificar antes de comprar carro usado",
    resumo: "A lista completa, do documento à vistoria.",
  },
];

const MARCAS_NA_HOME = 12;

export function GuiasHome() {
  return (
    <Section variant="light">
      <div className="mx-auto max-w-5xl">
        <p className="rp-section-eyebrow text-center">Guias</p>
        <h2 className="rp-section-heading mt-2 text-center">
          Antes de comprar um usado
        </h2>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIAS.map((g) => (
            <li key={g.href}>
              <Link href={g.href} className="rp-card block h-full p-5">
                <span className="font-semibold text-rp-primary-900">
                  {g.titulo}
                </span>
                <span className="mt-1 block text-sm text-rp-slate-600">
                  {g.resumo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm">
          <Link
            href="/blog"
            className="font-semibold text-rp-primary-700 hover:underline"
          >
            Ver todos os guias
          </Link>
        </p>
      </div>
    </Section>
  );
}

export async function MarcasFipeHome() {
  // A home não pode cair se o banco falhar: sem marcas, a seção some.
  const marcas = await listarMarcas().catch(() => []);
  if (marcas.length === 0) return null;

  const porSlug = new Map(marcas.map((m) => [m.slugMarca, m]));
  const destaque = MARCAS_POPULARES.flatMap((slug) => {
    const m = porSlug.get(slug);
    return m ? [m] : [];
  }).slice(0, MARCAS_NA_HOME);
  if (destaque.length === 0) return null;

  return (
    <Section variant="white">
      <div className="mx-auto max-w-5xl">
        <p className="rp-section-eyebrow text-center">Tabela FIPE</p>
        <h2 className="rp-section-heading mt-2 text-center">
          Preço FIPE por marca
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {destaque.map((m) => (
            <li key={m.slugMarca}>
              <Link
                href={`/tabela-fipe/${m.slugMarca}`}
                className="rp-card block h-full p-4"
              >
                {/* Nome em cima e contagem embaixo: lado a lado, "Caoa
                    Chery/Chery" + "33 modelos" estourava a tela de 375px. */}
                <span className="block break-words font-semibold text-rp-slate-900">
                  {m.marca}
                </span>
                <span className="mt-1 block text-xs text-rp-slate-500">
                  {m.totalModelos} {m.totalModelos === 1 ? "modelo" : "modelos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm">
          <Link
            href="/tabela-fipe"
            className="font-semibold text-rp-primary-700 hover:underline"
          >
            Ver todas as {marcas.length} marcas
          </Link>
        </p>
      </div>
    </Section>
  );
}
