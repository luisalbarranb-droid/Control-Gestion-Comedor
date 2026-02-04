
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIRecommendPurchasesInputSchema = z.object({
    lowStockItems: z.array(
        z.object({
            id: z.string(),
            nombre: z.string(),
            cantidad: z.number(),
            stockMinimo: z.number(),
            unidadReceta: z.string(),
            categoriaId: z.string(),
        })
    ).describe('Lista de artículos que están por debajo del stock mínimo.'),
});

export type AIRecommendPurchasesInput = z.infer<typeof AIRecommendPurchasesInputSchema>;

const AIRecommendPurchasesOutputSchema = z.array(
    z.object({
        itemId: z.string(),
        nombre: z.string(),
        cantidadSugerida: z.number(),
        prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
        mensaje: z.string().describe('Explicación del porqué comprar esta cantidad.'),
    })
);

export type AIRecommendPurchasesOutput = z.infer<typeof AIRecommendPurchasesOutputSchema>;

const prompt = ai.definePrompt({
    name: 'aiRecommendPurchasesPrompt',
    input: { schema: AIRecommendPurchasesInputSchema },
    output: { schema: AIRecommendPurchasesOutputSchema },
    prompt: `Eres un experto en suministros de comedor industrial. Analiza los siguientes productos con stock bajo y genera una lista de compras recomendada.
  
  Considera que productos como 'carnes' o 'verduras' son críticos para el servicio diario.
  La 'cantidadSugerida' debe ser suficiente para superar el stock mínimo en al menos un 50%.

  Artículos con Stock Bajo:
  {{#each lowStockItems}}
    - {{nombre}} (ID: {{id}}): Stock actual {{cantidad}} {{unidadReceta}}, Mínimo requerido {{stockMinimo}} {{unidadReceta}}. Categoría: {{categoriaId}}.
  {{/each}}

  Genera la lista de compras en formato JSON con la prioridad y el razonamiento.
  `,
});

export const aiRecommendPurchases = ai.defineFlow(
    {
        name: 'aiRecommendPurchasesFlow',
        inputSchema: AIRecommendPurchasesInputSchema,
        outputSchema: AIRecommendPurchasesOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
