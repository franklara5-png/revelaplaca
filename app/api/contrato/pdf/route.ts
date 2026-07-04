import { NextResponse } from "next/server";
import { gerarContratoPdf } from "@/lib/contrato/gerar-pdf";
import { validarContrato } from "@/lib/contrato/schema";
import { registrarEvento } from "@/lib/eventos";
import { formatarPlaca } from "@/lib/placa";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const dados = validarContrato(body);
  if (!dados) {
    return NextResponse.json(
      { erro: "Preencha todos os campos obrigatórios corretamente." },
      { status: 400 },
    );
  }

  try {
    const pdf = await gerarContratoPdf(dados);

    void registrarEvento("contrato_gerado", { placa: dados.veiculoPlaca });

    const placaFmt = formatarPlaca(dados.veiculoPlaca).replace(/[^A-Z0-9]/gi, "");
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${placaFmt}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (erro) {
    console.error("[contrato/pdf]", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar o PDF. Tente novamente." },
      { status: 500 },
    );
  }
}
