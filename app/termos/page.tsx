import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-url";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = getSeoMetadata({
  title: "Termos de uso",
  description: `Termos de uso do ${SITE_NAME} — consulta veicular pela placa.`,
  path: "/termos",
  noindex: true,
});

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de uso">
      <p className="text-sm text-rp-slate-500">Última atualização: março de 2026</p>

      <h2>1. Objeto do serviço</h2>
      <p>
        O {SITE_NAME} oferece consulta veicular pela placa com dados básicos
        gratuitos e relatório completo pago. As informações referem-se
        exclusivamente ao <strong>veículo</strong>, não ao proprietário.
      </p>

      <h2>2. Natureza informativa</h2>
      <p>
        Os resultados têm caráter informativo e são obtidos de fontes públicas e
        parceiros de dados autorizados. Não substituem vistoria presencial,
        perícia, despachante ou consultas oficiais nos órgãos competentes.
      </p>

      <h2>3. Consulta gratuita e limites</h2>
      <p>
        A consulta básica está sujeita a verificação anti-bot, limite de
        requisições por hora e disponibilidade das bases consultadas. Não
        garantimos resultado para 100% das placas em todos os momentos.
      </p>

      <h2>4. Relatório completo</h2>
      <p>
        O relatório pago é entregue por link de acesso temporário (90 dias),
        enviado ao e-mail informado no checkout. O pagamento é processado pelo
        Asaas (Pix ou cartão). Reembolsos seguem a legislação aplicável e
        análise caso a caso quando o relatório não puder ser entregue por falha
        técnica comprovada.
      </p>

      <h2>5. Uso permitido</h2>
      <p>
        É proibido usar o serviço para fins ilícitos, scraping automatizado,
        revenda em massa de consultas ou tentativa de obter dados pessoais de
        proprietários. Violações podem resultar em bloqueio de acesso.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        Marca, layout e conteúdo editorial do site pertencem ao {SITE_NAME}.
        Dados de terceiros (FIPE, bases públicas) permanecem sujeitos às
        condições de uso de suas fontes.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        Não respondemos por decisões de compra ou venda tomadas com base apenas
        nas consultas, por indisponibilidade temporária do serviço ou por
        divergências entre bases de dados e a situação real do veículo.
      </p>

      <h2>8. Alterações</h2>
      <p>
        Estes termos podem ser atualizados. O uso continuado após alterações
        implica concordância com a versão vigente publicada nesta página.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas sobre estes termos: utilize os canais indicados no site ou o
        e-mail de contato informado no rodapé quando disponível.
      </p>
    </LegalLayout>
  );
}
