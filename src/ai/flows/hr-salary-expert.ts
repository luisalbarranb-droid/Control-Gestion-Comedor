
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HRSalaryExpertInputSchema = z.object({
    question: z.string().describe('The user question about Venezuelan labor law or payroll.'),
    context: z.object({
        employeeName: z.string().optional(),
        baseSalary: z.number().optional(),
        normalSalary: z.number().optional(),
        integralSalary: z.number().optional(),
        fechaIngreso: z.string().optional(),
    }).optional().describe('Relevant employee context for specific calculations.'),
});

export type HRSalaryExpertInput = z.infer<typeof HRSalaryExpertInputSchema>;

const HRSalaryExpertOutputSchema = z.object({
    answer: z.string().describe('The detailed explanation provided by the expert.'),
    recommendation: z.string().optional().describe('Actionable advice or specific formula recommendation.'),
    legalArticles: z.array(z.string()).optional().describe('Relevant LOTTT articles cited.'),
});

export type HRSalaryExpertOutput = z.infer<typeof HRSalaryExpertOutputSchema>;

const prompt = ai.definePrompt({
    name: 'hrSalaryExpertPrompt',
    input: { schema: HRSalaryExpertInputSchema },
    output: { schema: HRSalaryExpertOutputSchema },
    prompt: `Eres un Asistente Experto en Gestión de Recursos Humanos y Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT) de la República Bolivariana de Venezuela.
Tu objetivo es guiar al usuario de forma cómoda y segura en la gestión de nómina, cálculos de salarios y beneficios sociales.

Pregunta del usuario: "{{question}}"

{{#if context}}
Contexto del Empleado Actual:
- Nombre: {{context.employeeName}}
- Salario Base: {{context.baseSalary}}
- Salario Normal: {{context.normalSalary}}
- Salario Integral: {{context.integralSalary}}
- Fecha de Ingreso: {{context.fechaIngreso}}
{{/if}}

Instrucciones:
1. Responde con precisión legal basándote en la LOTTT vigente (Venezuela).
2. Explica la diferencia entre Salario Normal (Art. 104) y Salario Integral si el usuario pregunta por cálculos de prestaciones.
3. Menciona artículos relevantes de la ley (Ej: Art. 142 para Prestaciones Sociales, Art. 190 para Vacaciones, Art. 131 para Utilidades).
4. Sé amable, profesional y motivador. Asegura al usuario que los cálculos deben ser precisos para evitar sanciones legales.
5. Si el usuario pide redactar una constancia, proporciona los puntos clave que debe llevar.

Respuesta:
`,
});

export const hrSalaryExpertFlow = ai.defineFlow(
    {
        name: 'hrSalaryExpertFlow',
        inputSchema: HRSalaryExpertInputSchema,
        outputSchema: HRSalaryExpertOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function askSalaryExpert(input: HRSalaryExpertInput): Promise<HRSalaryExpertOutput> {
    return hrSalaryExpertFlow(input);
}
