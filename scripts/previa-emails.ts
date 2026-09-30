// Gera os e-mails do site com dados de exemplo, para revisar o visual sem
// precisar disparar o fluxo real (cadastro, pagamento, etc).
//
//   node --conditions=react-server --import tsx scripts/previa-emails.ts <pasta-saida>
//
// A flag react-server e o que deixa importar os templates, que sao
// "server-only".
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  emailRedefinirSenha,
  emailVerificarEndereco,
} from "@/lib/email-templates/conta";
import {
  emailPedidoAbandonado,
  emailRelatorioPronto,
  emailRelatorioProcessando,
} from "@/lib/email-templates/pedidos";

const saida = process.argv[2] ?? "previa-emails";
mkdirSync(saida, { recursive: true });

const link = "https://revelaplaca.com.br/exemplo";

const emails = {
  "1-confirmar-email": emailVerificarEndereco(link, "Maria Souza"),
  "2-redefinir-senha": emailRedefinirSenha(link, "Maria Souza"),
  "3-relatorio-pronto": emailRelatorioPronto(link, "BRA-2E19", 90),
  "4-relatorio-processando": emailRelatorioProcessando("BRA-2E19"),
  "5-pedido-abandonado": emailPedidoAbandonado(link, "BRA-2E19"),
};

for (const [nome, corpo] of Object.entries(emails)) {
  writeFileSync(join(saida, `${nome}.html`), corpo.html);
  console.log(`${nome}.html — assunto: ${corpo.subject}`);
}
