import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { z } from 'zod';

const CONFIG_DIR = join(homedir(), '.agentage');
const CONTEXT_FILE = join(CONFIG_DIR, 'context.json');

/**
 * Context data schema for system prompt storage
 */
export const contextDataSchema = z.object({
  systemPrompt: z.string().default(''),
});

export type ContextData = z.infer<typeof contextDataSchema>;

/**
 * Load context data from context.json
 */
export const loadContextData = async (): Promise<ContextData> => {
  try {
    const data = await readFile(CONTEXT_FILE, 'utf-8');
    const parsed = JSON.parse(data) as unknown;
    return contextDataSchema.parse(parsed);
  } catch {
    // Return default if file doesn't exist or is invalid
    return { systemPrompt: '' };
  }
};

/**
 * Save context data to context.json
 */
export const saveContextData = async (data: ContextData): Promise<void> => {
  // Validate data
  const validated = contextDataSchema.parse(data);

  // Ensure directory exists
  await mkdir(CONFIG_DIR, { recursive: true });

  // Write file
  await writeFile(CONTEXT_FILE, JSON.stringify(validated, null, 2), 'utf-8');
};
