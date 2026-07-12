import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-url";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = getSeoMetadata({
  title: "Política de privacidade",
  description: `Política de privacidade e LGPD do ${SITE_NAME}.`,
  path: "/privacidade",
  noindex: true,
});

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de privacidade">
      <p className="text-sm text-rp-slate-500">Última atualização: março de 2026</p>

      <h2>1. Compromisso com a LGPD</h2>
      <p>
        O {SITE_NAME} é operado por Altivia Tecnologia e Serviços Digitais LTDA
        (CNPJ 63.101.423/0001-18) e trata dados pessoais em conformidade com a
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Nosso produto foca
        em{" "}
        <strong>dados do veículo</strong> — não coletamos nem exibimos nome, CPF,
        CNPJ ou endereço do proprietário.
      </p>

      <h2>2. Dados que tratamos</h2>
      <ul>
        <li>
          <strong>Consulta grátis:</strong> placa informada; hash do IP (nunca IP
          puro) para rate limit; registro de consulta com data e origem.
        </li>
        <li>
          <strong>Relatório pago:</strong> e-mail para entrega do link; dados de
          pagamento processados pelo Asaas (não armazenamos número de cartão).
        </li>
        <li>
          <strong>Navegação:</strong> métricas agregadas via Vercel Analytics
          (sem identificação direta do titular para fins de perfil comportamental
          comercial).
        </li>
      </ul>

      <h2>3. Dados que NÃO tratamos</h2>
      <p>
        Se fornecedores retornarem campos de proprietário, descartamos antes de
        persistir ou exibir. Páginas públicas e APIs não devolvem essas
        informações, mesmo mascaradas.
      </p>

      <h2>4. Finalidades e bases legais</h2>
      <ul>
        <li>Executar consulta solicitada (execução de contrato / legítimo interesse).</li>
        <li>Processar pagamento e entregar relatório (execução de contrato).</li>
        <li>Prevenir abuso e fraude — rate limit, Turnstile (legítimo interesse).</li>
        <li>Melhorar o serviço com estatísticas agregadas (legítimo interesse).</li>
      </ul>

      <h2>5. Fontes de dados veiculares</h2>
      <p>
        Utilizamos Tabela FIPE (referência pública de preços), bases públicas e
        APIs de parceiros autorizados. Cada fonte possui regras próprias de
        atualização e cobertura.
      </p>

      <h2>6. Compartilhamento</h2>
      <p>
        Compartilhamos dados apenas com operadores necessários: hospedagem
        (Vercel), banco de dados (Neon), pagamentos (Asaas), e-mail transacional
        (Brevo, quando configurado) e verificação anti-bot (Cloudflare Turnstile).
        Não vendemos bases de usuários.
      </p>

      <h2>7. Retenção</h2>
      <ul>
        <li>Cache de consulta básica: até 30 dias.</li>
        <li>Relatório pago: acesso por 90 dias via link; registros de pedido conforme obrigação fiscal.</li>
        <li>Logs de consulta: período necessário para segurança e estatísticas reais.</li>
      </ul>

      <h2>8. Seus direitos</h2>
      <p>
        Você pode solicitar confirmação de tratamento, correção, eliminação ou
        informações sobre compartilhamento, nos termos da LGPD. Como o acesso ao
        relatório é por link mágico sem conta, identifique-se pelo e-mail usado
        no checkout ao entrar em contato.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Aplicamos HTTPS, segredos em variáveis de ambiente, hash de IP e
        validação de webhooks. Nenhum sistema é 100% inviolável; notificaremos
        incidentes relevantes conforme a lei.
      </p>

      <h2>10. Cookies e armazenamento local</h2>
      <p>
        Não usamos cookies para funil crítico além do necessário à operação
        (ex.: Turnstile). Não armazenamos dados sensíveis do funil em{" "}
        <code>localStorage</code>.
      </p>

      <h2>11. Alterações</h2>
      <p>
        Esta política pode ser atualizada. A data no topo indica a versão
        vigente.
      </p>
    </LegalLayout>
  );
}
