import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";
import { obterIpHash } from "@/lib/ip-hash";
import { validarTurnstile, turnstileConfigurado } from "@/lib/turnstile";
import {
  rateLimitExcedido,
  registrarConsulta,
} from "@/lib/rate-limit";
import {
  buscarVeiculoCache,
  consultarFornecedorBasico,
  persistirVeiculo,
  veiculoParaResposta,
} from "@/lib/veiculos";
import { registrarEvento } from "@/lib/eventos";

const bodySchema = z.object({
  placa: z.string().min(1),
  turnstileToken: z.string().optional(),
  origem: z.string().optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;

  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { erro: "Requisição inválida." },
      { status: 400 },
    );
  }

  const placa = normalizarPlaca(body.placa);

  if (!validarPlaca(placa)) {
    return NextResponse.json(
      { erro: "Placa inválida. Use o formato ABC1234 ou ABC1D23." },
      { status: 400 },
    );
  }

  const turnstileOk =
    process.env.NODE_ENV === "development" && !turnstileConfigurado()
      ? true
      : await validarTurnstile(body.turnstileToken ?? "");

  if (!turnstileOk) {
    return NextResponse.json(
      { erro: "Verificação de segurança falhou. Tente novamente." },
      { status: 403 },
    );
  }

  // Sem IP_HASH_SALT o hash lanca (de proposito, para nunca guardar hash
  // reversivel). Aqui NAO da para seguir inerte: sem hash nao ha rate limit, e
  // a chamada seguinte e paga. Entao recusa com 503 legivel em vez de 500.
  let ipHash: string;
  try {
    ipHash = await obterIpHash();
  } catch (erro) {
    console.error("[consulta] IP_HASH_SALT ausente — consulta recusada:", erro);
    return NextResponse.json(
      {
        erro:
          "A consulta está temporariamente indisponível. Tente novamente em instantes.",
      },
      { status: 503 },
    );
  }

  if (await rateLimitExcedido(ipHash)) {
    return NextResponse.json(
      {
        erro:
          "Você atingiu o limite de consultas gratuitas por hora. Tente novamente em instantes.",
      },
      { status: 429 },
    );
  }

  const cache = await buscarVeiculoCache(placa);

  if (cache) {
    await registrarConsulta({
      placa,
      ipHash,
      origem: body.origem,
      cacheHit: true,
    });

    void registrarEvento("consulta_gratis", {
      placa,
      meta: { cacheHit: true, origem: body.origem },
    });

    return NextResponse.json({
      ok: true,
      cacheHit: true,
      dados: veiculoParaResposta(cache),
    });
  }

  // Registrar ANTES de chamar o fornecedor.
  //
  // Antes o registro so acontecia depois de a consulta dar certo, e o
  // rateLimitExcedido conta exatamente essas linhas. Ou seja: tentativa que
  // FALHAVA nao entrava na conta, e quem batesse em placas que falham tinha
  // tentativas ilimitadas — cada uma custando uma chamada ao fornecedor, que
  // e paga. O limite protegia tudo menos o que custa dinheiro.
  await registrarConsulta({
    placa,
    ipHash,
    origem: body.origem,
    cacheHit: false,
  });

  const fornecedor = await consultarFornecedorBasico(placa);

  if (!fornecedor) {
    return NextResponse.json(
      {
        erro:
          "Não conseguimos consultar esta placa agora. Tente novamente em instantes.",
      },
      { status: 503 },
    );
  }

  const salvo = await persistirVeiculo(fornecedor.dados, fornecedor.bruto);

  void registrarEvento("consulta_gratis", {
    placa,
    meta: { cacheHit: false, origem: body.origem },
  });

  return NextResponse.json({
    ok: true,
    cacheHit: false,
    dados: salvo ? veiculoParaResposta(salvo) : fornecedor.dados,
  });
}
