import { exec } from 'child_process';
import { promisify } from 'util';
import type { ToolContext, ToolHandler } from '../types.js';

const execAsync = promisify(exec);

interface RunShellInput {
  command: string;
  timeout?: number;
}

interface RunShellOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute a shell command
 * Uses workspace path as cwd if available in context
 */
export const handler: ToolHandler<RunShellInput, RunShellOutput> = async (
  input,
  context?: ToolContext
) => {
  const timeout = input.timeout ?? 30000;

  try {
    const { stdout, stderr } = await execAsync(input.command, {
      timeout,
      cwd: context?.workspacePath,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    return { stdout, stderr, exitCode: 0 };
  } catch (error) {
    const execError = error as Error & {
      stdout?: string;
      stderr?: string;
      code?: number;
      killed?: boolean;
    };

    // Command failed but completed (non-zero exit code)
    if (execError.code !== undefined && !execError.killed) {
      return {
        stdout: execError.stdout ?? '',
        stderr: execError.stderr ?? execError.message,
        exitCode: execError.code,
      };
    }

    // Timeout or other error
    throw new Error(`Shell command failed: ${execError.message}`);
  }
};
