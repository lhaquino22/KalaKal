import z from "zod";

export const kalacalFormSchema = z.object({
  caso_id: z.string().optional(),
  modelo: z.string().nonempty("Por favor, selecione o modelo."),
  faixa_etaria_kalacal: z.number().min(0, "Por favor, selecione a faixa etária."),
  sitios_sangramento: z.number().min(0, "Por favor, informe os locais de sangramento."),
  edema: z.boolean(),
  aids: z.boolean(),
  ictericia: z.boolean(),
  dispneia: z.boolean(),
  infeccao: z.boolean(),
  vomitos: z.boolean(),
  leucopenia: z.boolean(),
  plaquetopenia: z.boolean(),
  insuficiencia_renal: z.boolean(),
  hepatite: z.boolean(),
  observacoes: z.string().optional(),
});

export const step1Schema = kalacalFormSchema.pick({
  faixa_etaria_kalacal: true,
  modelo: true,
});

export const step2Schema = kalacalFormSchema.pick({
  sitios_sangramento: true,
});