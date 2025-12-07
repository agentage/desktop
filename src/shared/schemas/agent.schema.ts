import { z } from 'zod';

export const agentSchema = z.object({
  name: z.string().min(1),
  model: z.string().default('gpt-4'),
  instructions: z.string().min(1),
  tools: z.array(z.string()).optional(),
  variables: z.record(z.unknown()).optional(),
});

export type Agent = z.infer<typeof agentSchema>;

export const agentMetadataSchema = z.object({
  name: z.string(),
  owner: z.string(),
  description: z.string().optional(),
  version: z.string(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private']).default('private'),
});

export type AgentMetadata = z.infer<typeof agentMetadataSchema>;
