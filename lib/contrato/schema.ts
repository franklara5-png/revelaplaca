import { z } from "zod";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";

export const contratoSchema = z.object({
  vendedorNome: z.string().min(3).max(120),
  vendedorDoc: z.string().min(11).max(18),
  vendedorEndereco: z.string().min(5).max(200),
  compradorNome: z.string().min(3).max(120),
  compradorDoc: z.string().min(11).max(18),
  compradorEndereco: z.string().min(5).max(200),
  veiculoPlaca: z.string().min(7).max(8),
  veiculoMarca: z.string().min(1).max(60),
  veiculoModelo: z.string().min(1).max(80),
  veiculoAno: z.string().min(4).max(9),
  veiculoCor: z.string().min(2).max(40),
  veiculoRenavam: z.string().max(20).optional(),
  veiculoChassi: z.string().max(30).optional(),
  valorVenda: z.string().min(1).max(30),
  formaPagamento: z.string().min(3).max(200),
  localData: z.string().min(5).max(120),
  testemunha1Nome: z.string().min(3).max(120),
  testemunha1Doc: z.string().min(11).max(18),
  testemunha2Nome: z.string().min(3).max(120),
  testemunha2Doc: z.string().min(11).max(18),
});

export type DadosContrato = z.infer<typeof contratoSchema>;

export function validarContrato(input: unknown): DadosContrato | null {
  const parsed = contratoSchema.safeParse(input);
  if (!parsed.success) return null;

  const placa = normalizarPlaca(parsed.data.veiculoPlaca);
  if (!validarPlaca(placa)) return null;

  return { ...parsed.data, veiculoPlaca: placa };
}
