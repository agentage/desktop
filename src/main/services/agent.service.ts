import { spawn } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const AGENTS_DIR = join(homedir(), '.agentage', 'agents');

export const listAgents = async (): Promise<string[]> => {
  try {
    const files = await readdir(AGENTS_DIR);
    return files.filter((f) => f.endsWith('.agent.md') || f.endsWith('.yml'));
  } catch {
    return [];
  }
};

export const loadAgentContent = async (name: string): Promise<string | null> => {
  const possiblePaths = [
    join(AGENTS_DIR, `${name}.agent.md`),
    join(AGENTS_DIR, `${name}.yml`),
    join(AGENTS_DIR, name),
  ];

  for (const path of possiblePaths) {
    try {
      const content = await readFile(path, 'utf-8');
      return content;
    } catch {
      continue;
    }
  }

  return null;
};

export const runAgent = async (name: string, prompt: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const proc = spawn('agent', ['run', name, prompt], {
      cwd: homedir(),
      shell: true,
    });

    proc.stdout.on('data', (data: Buffer) => {
      chunks.push(data.toString());
    });

    proc.stderr.on('data', (data: Buffer) => {
      chunks.push(data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(chunks.join(''));
      } else {
        reject(
          new Error(`Agent exited with code ${String(code ?? 'unknown')}: ${chunks.join('')}`)
        );
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn agent: ${err.message}`));
    });
  });
