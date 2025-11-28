'use server';

/**
 * @fileOverview An AI-powered task prioritization tool.
 *
 * - aiPrioritizeTasks - A function that handles the task prioritization process.
 * - AIPrioritizeTasksInput - The input type for the aiPrioritizeTasks function.
 * - AIPrioritizeTasksOutput - The return type for the aiPrioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string().describe('Unique identifier for the task.'),
      title: z.string().describe('Title of the task.'),
      description: z.string().describe('Detailed description of the task.'),
      area: z.string().describe('Area the task belongs to (e.g., cocina, servicio).'),
      asignadoA: z.string().describe('User ID assigned to the task.'),
      estado: z
        .enum(['pendiente', 'en-progreso', 'completada', 'verificada', 'rechazada'])
        .describe('Current status of the task.'),
      prioridad: z
        .enum(['baja', 'media', 'alta', 'urgente'])
        .describe('Current priority of the task.'),
      fechaVencimiento: z.string().describe('Due date of the task (ISO format).'),
      tiempoEstimado: z
        .number()
        .describe('Estimated time to complete the task in minutes.'),
    })
  ).describe('Array of tasks to prioritize.'),
  users: z.array(
    z.object({
      userId: z.string().describe('Unique identifier for the user.'),
      rol: z.enum(['superadmin', 'admin', 'comun']).describe('Role of the user.'),
      area: z.string().describe('Area the user belongs to.'),
    })
  ).describe('Array of users and their roles.'),
});

export type AIPrioritizeTasksInput = z.infer<typeof AIPrioritizeTasksInputSchema>;

const AIPrioritizeTasksOutputSchema = z.array(
  z.object({
    taskId: z.string().describe('Unique identifier for the task.'),
    nuevaPrioridad: z
      .enum(['baja', 'media', 'alta', 'urgente'])
      .describe('AI-recommended priority for the task.'),
    razonamiento: z
      .string()
      .describe('Explanation for the AI-recommended priority change.'),
  })
);

export type AIPrioritizeTasksOutput = z.infer<typeof AIPrioritizeTasksOutputSchema>;

export async function aiPrioritizeTasks(input: AIPrioritizeTasksInput): Promise<AIPrioritizeTasksOutput> {
  return aiPrioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPrioritizeTasksPrompt',
  input: {schema: AIPrioritizeTasksInputSchema},
  output: {schema: AIPrioritizeTasksOutputSchema},
  prompt: `You are an AI task prioritization expert. Analyze the following tasks and user workloads to suggest optimal task priorities.

Tasks:
{{#each tasks}}
  - Task ID: {{taskId}}
    Title: {{title}}
    Description: {{description}}
    Area: {{area}}
    Assigned To: {{asignadoA}}
    Current Status: {{estado}}
    Current Priority: {{prioridad}}
    Due Date: {{fechaVencimiento}}
    Estimated Time: {{tiempoEstimado}} minutes
{{/each}}

Users:
{{#each users}}
  - User ID: {{userId}}
    Role: {{rol}}
    Area: {{area}}
{{/each}}

Consider the following factors when prioritizing tasks:
- Task urgency (due date)
- Task importance (area and potential impact)
- User workload (number of assigned tasks, roles, and areas)

Provide a new priority for each task, along with a brief explanation for the change. Return the response in JSON format.

Prioritized Tasks:
`,
});

const aiPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'aiPrioritizeTasksFlow',
    inputSchema: AIPrioritizeTasksInputSchema,
    outputSchema: AIPrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
