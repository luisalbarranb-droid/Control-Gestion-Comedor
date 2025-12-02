'use server';

/**
 * @fileOverview An AI flow to extract structured data from an invoice image using OCR.
 *
 * - extractInvoiceData - A function that handles the invoice data extraction process.
 * - ExtractInvoiceInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceOutput - The return type for the extractInvoiceData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractInvoiceInputSchema = z.object({
  invoicePhoto: z
    .string()
    .describe(
      "A photo of an invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInvoiceInput = z.infer<typeof ExtractInvoiceInputSchema>;

const ExtractInvoiceOutputSchema = z.object({
  proveedor: z.string().describe('The name of the supplier/vendor found on the invoice.'),
  fecha: z.string().describe('The date of the invoice in YYYY-MM-DD format.'),
  items: z
    .array(
      z.object({
        nombre: z.string().describe('The description or name of the item.'),
        quantity: z.number().describe('The quantity of the item.'),
        costoUnitario: z.number().describe('The unit cost/price of the item.'),
      })
    )
    .describe('A list of line items found on the invoice.'),
});
export type ExtractInvoiceOutput = z.infer<typeof ExtractInvoiceOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceInput): Promise<ExtractInvoiceOutput> {
  return extractInvoiceDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: { schema: ExtractInvoiceInputSchema },
  output: { schema: ExtractInvoiceOutputSchema },
  prompt: `You are an expert OCR system specializing in extracting structured data from invoices.
Analyze the provided invoice image and extract the following information:
- The supplier's name (proveedor).
- The invoice date (fecha), formatted as YYYY-MM-DD.
- A list of all line items (items), where each item includes its name/description (nombre), its quantity (quantity), and its unit price (costoUnitario).

Return the data in a clean JSON format.

Invoice Image:
{{media url=invoicePhoto}}
`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceInputSchema,
    outputSchema: ExtractInvoiceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
