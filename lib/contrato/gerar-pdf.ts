import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DadosContrato } from "@/lib/contrato/schema";
import { formatarPlaca } from "@/lib/placa";
import { SITE_NAME } from "@/lib/site-url";

const MARGEM = 50;
const LARGURA_LINHA = 495;

function quebrarTexto(texto: string, maxChars: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";

  for (const palavra of palavras) {
    const candidato = atual ? `${atual} ${palavra}` : palavra;
    if (candidato.length > maxChars && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = candidato;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export async function gerarContratoPdf(dados: DadosContrato): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([595, 842]);
  let y = 800;

  function novaPaginaSeNecessario(altura = 40) {
    if (y - altura < MARGEM) {
      page = doc.addPage([595, 842]);
      y = 800;
    }
  }

  function escrever(
    texto: string,
    opts: { size?: number; bold?: boolean; indent?: number; gap?: number } = {},
  ) {
    const size = opts.size ?? 10;
    const f = opts.bold ? fontBold : font;
    const indent = opts.indent ?? 0;
    const linhas = quebrarTexto(texto, Math.floor((LARGURA_LINHA - indent) / (size * 0.5)));

    for (const linha of linhas) {
      novaPaginaSeNecessario(size + 6);
      page.drawText(linha, {
        x: MARGEM + indent,
        y,
        size,
        font: f,
        color: rgb(0.1, 0.1, 0.12),
      });
      y -= size + (opts.gap ?? 4);
    }
  }

  escrever("CONTRATO DE COMPRA E VENDA DE VEÍCULO", { size: 14, bold: true, gap: 10 });

  escrever(
    `Pelo presente instrumento particular, de um lado ${dados.vendedorNome}, inscrito(a) no CPF/CNPJ sob nº ${dados.vendedorDoc}, residente em ${dados.vendedorEndereco}, doravante VENDEDOR(A); e de outro ${dados.compradorNome}, inscrito(a) no CPF/CNPJ sob nº ${dados.compradorDoc}, residente em ${dados.compradorEndereco}, doravante COMPRADOR(A), têm entre si justo e contratado o seguinte:`,
  );

  y -= 6;
  escrever("CLÁUSULAS", { size: 11, bold: true, gap: 6 });

  const renavam = dados.veiculoRenavam ? `, RENAVAM ${dados.veiculoRenavam}` : "";
  const chassi = dados.veiculoChassi ? `, chassi ${dados.veiculoChassi}` : "";

  const clausulas = [
    `1ª — O(A) VENDEDOR(A) declara ser legítimo(a) proprietário(a) do veículo ${dados.veiculoMarca} ${dados.veiculoModelo}, ano ${dados.veiculoAno}, cor ${dados.veiculoCor}, placa ${formatarPlaca(dados.veiculoPlaca)}${renavam}${chassi}, livre e desembaraçado de ônus, salvo o aqui declarado.`,
    `2ª — O(A) VENDEDOR(A) vende ao(à) COMPRADOR(A) o veículo descrito na cláusula anterior pelo valor total de R$ ${dados.valorVenda}, pago da seguinte forma: ${dados.formaPagamento}.`,
    `3ª — A entrega do veículo e da documentação ocorrerá na data da assinatura deste contrato, salvo combinação diversa entre as partes.`,
    `4ª — O(A) COMPRADOR(A) assume a responsabilidade pela transferência junto ao DETRAN e demais órgãos competentes, bem como por débitos, multas e tributos incidentes a partir da data da tradição.`,
    `5ª — O(A) VENDEDOR(A) garante que o veículo encontra-se em condições de circulação e que as informações prestadas são verdadeiras, sob pena das sanções legais cabíveis.`,
    `6ª — As partes elegem o foro da comarca de ${dados.localData.split(",")[0]?.trim() || "domicílio do comprador"} para dirimir quaisquer dúvidas oriundas deste contrato.`,
  ];

  for (const clausula of clausulas) {
    escrever(clausula, { indent: 0 });
    y -= 2;
  }

  y -= 4;
  escrever(`Local e data: ${dados.localData}`, { bold: true });
  y -= 12;

  escrever("ASSINATURAS", { size: 11, bold: true, gap: 8 });

  const assinaturas = [
    { rotulo: "VENDEDOR(A)", nome: dados.vendedorNome },
    { rotulo: "COMPRADOR(A)", nome: dados.compradorNome },
    { rotulo: "TESTEMUNHA 1", nome: `${dados.testemunha1Nome} — CPF/CNPJ ${dados.testemunha1Doc}` },
    { rotulo: "TESTEMUNHA 2", nome: `${dados.testemunha2Nome} — CPF/CNPJ ${dados.testemunha2Doc}` },
  ];

  for (const item of assinaturas) {
    novaPaginaSeNecessario(50);
    page.drawLine({
      start: { x: MARGEM, y },
      end: { x: MARGEM + 220, y },
      thickness: 0.5,
      color: rgb(0.4, 0.4, 0.45),
    });
    y -= 14;
    escrever(item.rotulo, { size: 9, bold: true, gap: 2 });
    escrever(item.nome, { size: 9, gap: 14 });
  }

  novaPaginaSeNecessario(30);
  y = Math.min(y, 80);
  page.drawLine({
    start: { x: MARGEM, y: 45 },
    end: { x: MARGEM + LARGURA_LINHA, y: 45 },
    thickness: 0.3,
    color: rgb(0.75, 0.75, 0.78),
  });
  page.drawText(
    `Modelo gerado por ${SITE_NAME} — não substitui orientação jurídica. Revise com advogado antes de assinar.`,
    {
      x: MARGEM,
      y: 30,
      size: 8,
      font,
      color: rgb(0.45, 0.45, 0.5),
    },
  );

  return doc.save();
}
