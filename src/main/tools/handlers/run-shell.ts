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
  truncated: boolean;
}

/**
 * Maximum output length to prevent context window exhaustion (~5k tokens)
 */
const MAX_OUTPUT_LENGTH = 20000;

/**
 * Truncate output and add indicator if needed
 */
const truncateOutput = (output: string): { text: string; wasTruncated: boolean } => {
  if (output.length <= MAX_OUTPUT_LENGTH) {
    return { text: output, wasTruncated: false };
  }
  return {
    text: output.slice(0, MAX_OUTPUT_LENGTH) + '\n\n[Output truncated...]',
    wasTruncated: true,
  };
};

/**
 * Execute a shell command
 * Uses workspace path as cwd if available in context
 * Output is truncated to prevent context window exhaustion
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

    const truncatedStdout = truncateOutput(stdout);
    const truncatedStderr = truncateOutput(stderr);

    return {
      stdout: truncatedStdout.text,
      stderr: truncatedStderr.text,
      exitCode: 0,
      truncated: truncatedStdout.wasTruncated || truncatedStderr.wasTruncated,
    };
  } catch (error) {
    const execError = error as Error & {
      stdout?: string;
      stderr?: string;
      code?: number;
      killed?: boolean;
    };

    // Command failed but completed (non-zero exit code)
    if (execError.code !== undefined && !execError.killed) {
      const truncatedStdout = truncateOutput(execError.stdout ?? '');
      const truncatedStderr = truncateOutput(execError.stderr ?? execError.message);

      return {
        stdout: truncatedStdout.text,
        stderr: truncatedStderr.text,
        exitCode: execError.code,
        truncated: truncatedStdout.wasTruncated || truncatedStderr.wasTruncated,
      };
    }

    // Timeout or other error
    throw new Error(`Shell command failed: ${execError.message}`);
  }
};
