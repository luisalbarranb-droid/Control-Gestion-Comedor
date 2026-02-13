
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface HRSalaryExpertInput {
    question: string;
    context?: {
        employeeName?: string;
        baseSalary?: number;
        normalSalary?: number;
        integralSalary?: number;
        fechaIngreso?: string;
    };
}

export interface HRSalaryExpertOutput {
    answer: string;
    recommendation?: string;
    legalArticles?: string[];
}

export async function askSalaryExpert(input: HRSalaryExpertInput): Promise<HRSalaryExpertOutput> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
        throw new Error('GOOGLE_GENAI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let contextBlock = '';
    if (input.context) {
        contextBlock = `
Contexto del Empleado Actual:
- Nombre: ${input.context.employeeName || 'No especificado'}
- Salario Base: ${input.context.baseSalary || 'No especificado'}
- Salario Normal: ${input.context.normalSalary || 'No especificado'}
- Salario Integral: ${input.context.integralSalary || 'No especificado'}
- Fecha de Ingreso: ${input.context.fechaIngreso || 'No especificado'}
`;
    }

    const prompt = `Eres un Asistente Experto en Gestión de Recursos Humanos y Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT) de la República Bolivariana de Venezuela.
Tu objetivo es guiar al usuario de forma cómoda y segura en la gestión de nómina, cálculos de salarios y beneficios sociales.

Pregunta del usuario: "${input.question}"

${contextBlock}

Instrucciones:
1. Responde con precisión legal basándote en la LOTTT vigente (Venezuela).
2. Explica la diferencia entre Salario Normal (Art. 104) y Salario Integral si el usuario pregunta por cálculos de prestaciones.
3. Menciona artículos relevantes de la ley (Ej: Art. 142 para Prestaciones Sociales, Art. 190 para Vacaciones, Art. 131 para Utilidades).
4. Sé amable, profesional y motivador. Asegura al usuario que los cálculos deben ser precisos para evitar sanciones legales.
5. Si el usuario pide redactar una constancia, proporciona los puntos clave que debe llevar.

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin bloques de código):
{
  "answer": "tu respuesta detallada aquí",
  "recommendation": "consejo práctico aquí",
  "legalArticles": ["Art. X LOTTT", "Art. Y LOTTT"]
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean the response text - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.slice(7);
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.slice(3);
        }
        if (cleanText.endsWith('```')) {
            cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();

        const parsed = JSON.parse(cleanText) as HRSalaryExpertOutput;
        return {
            answer: parsed.answer || 'Sin respuesta disponible.',
            recommendation: parsed.recommendation || undefined,
            legalArticles: parsed.legalArticles || undefined,
        };
    } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // If JSON parsing fails, return the raw text as the answer
        try {
            const result = await model.generateContent(input.question);
            const text = result.response.text();
            return {
                answer: text,
                recommendation: undefined,
                legalArticles: undefined,
            };
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw new Error('La IA no pudo procesar la consulta.');
        }
    }
}
