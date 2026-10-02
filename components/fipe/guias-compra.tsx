import Link from "next/link";

type Props = {
  // Nome que aparece nos títulos: "Fiat Argo" na página do modelo, "Fiat" na
  // da marca. Os links vão para os mesmos guias; muda só o texto âncora.
  veiculo: string;
};

// O post de leilão é o assunto com mais impressões no Search Console
// (02/10/2026) e só recebia links de outros posts. Cada página da tabela FIPE
// aponta para ele e para os guias vizinhos, com o nome do veículo no texto.
export function FipeGuiasCompra({ veiculo }: Props) {
  const guias = [
    {
      href: "/blog/como-saber-se-carro-foi-leilao",
      titulo: `Como saber se o ${veiculo} é de leilão`,
      resumo: "Os sinais no documento e no histórico que entregam um carro de leilão.",
    },
    {
      href: "/blog/como-saber-se-carro-e-roubado",
      titulo: `Como saber se um ${veiculo} é roubado`,
      resumo: "Como checar registro de roubo e furto antes de fechar negócio.",
    },
    {
      href: "/blog/restricoes-no-veiculo-o-que-significam",
      titulo: "Restrições no veículo: o que significam",
      resumo: "Gravame, Renajud, bloqueios: o que impede a transferência.",
    },
    {
      href: "/blog/o-que-verificar-antes-de-comprar-carro-usado",
      titulo: `O que verificar antes de comprar um ${veiculo} usado`,
      resumo: "A lista completa, do documento à vistoria.",
    },
  ];

  return (
    <section className="mt-12">
      <h2 className="rp-section-heading text-2xl">
        Antes de comprar um {veiculo}
      </h2>
      <p className="rp-body mt-3 max-w-3xl">
        O preço da tabela FIPE vale para um carro sem problemas. Leilão,
        sinistro ou restrição derrubam o valor — e nem sempre o vendedor conta.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {guias.map((g) => (
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
    </section>
  );
}
