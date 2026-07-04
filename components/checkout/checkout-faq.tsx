const ITENS = [
  {
    pergunta: "E se não constar nada sobre o veículo?",
    resposta:
      '"Nada consta" é o melhor resultado possível: significa que verificamos leilão, sinistro, roubo/furto, gravame e restrições nas fontes e o veículo está limpo. O relatório entrega a prova das verificações realizadas.',
  },
  {
    pergunta: "Em quanto tempo recebo?",
    resposta:
      "O Pix confirma em segundos. O relatório é gerado em até alguns minutos e enviado por e-mail — você também pode abri-lo na tela assim que estiver pronto.",
  },
  {
    pergunta: "É seguro pagar?",
    resposta:
      "O pagamento é processado pelo Asaas, instituição de pagamento autorizada pelo Banco Central. Não armazenamos dados de cartão em nossos servidores.",
  },
];

export function CheckoutFaq() {
  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-semibold text-rp-slate-900">Dúvidas antes de pagar</h3>
      {ITENS.map((item) => (
        <details
          key={item.pergunta}
          className="group rounded-2xl border border-rp-slate-100 bg-white"
        >
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-rp-ink marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              {item.pergunta}
              <span className="text-rp-slate-400 transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="border-t border-rp-slate-100 px-4 py-3 text-sm leading-relaxed text-rp-slate-600">
            {item.resposta}
          </p>
        </details>
      ))}
    </div>
  );
}
