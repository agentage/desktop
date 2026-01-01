/**
 * Tools System Tests
 */
import { describe, expect, it } from '@jest/globals';
import { builtinTools } from './definitions.js';
import { executeTool, getTool, listTools } from './index.js';

describe('tools - definitions', () => {
  it('should define search_github tool', () => {
    const tool = builtinTools.find((t) => t.name === 'search_github');
    expect(tool).toBeDefined();
    expect(tool?.description).toContain('GitHub');
    expect(tool?.inputSchema.properties).toHaveProperty('query');
    expect(tool?.inputSchema.required).toContain('query');
  });

  it('should define fetch_url tool', () => {
    const tool = builtinTools.find((t) => t.name === 'fetch_url');
    expect(tool).toBeDefined();
    expect(tool?.description).toContain('URL');
    expect(tool?.inputSchema.properties).toHaveProperty('url');
    expect(tool?.inputSchema.required).toContain('url');
  });

  it('should define run_shell tool', () => {
    const tool = builtinTools.find((t) => t.name === 'run_shell');
    expect(tool).toBeDefined();
    expect(tool?.description).toContain('shell');
    expect(tool?.inputSchema.properties).toHaveProperty('command');
    expect(tool?.inputSchema.required).toContain('command');
  });

  it('should have valid JSON Schema for all tools', () => {
    for (const tool of builtinTools) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeDefined();
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
    }
  });
});

describe('tools - registry', () => {
  describe('listTools', () => {
    it('should return all builtin tools', () => {
      const tools = listTools();
      expect(tools).toHaveLength(builtinTools.length);
      expect(tools.every((t) => t.source === 'builtin')).toBe(true);
    });

    it('should include tool metadata', () => {
      const tools = listTools();
      for (const tool of tools) {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.source).toBe('builtin');
      }
    });
  });

  describe('getTool', () => {
    it('should return tool by name', () => {
      const tool = getTool('search_github');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('search_github');
      expect(tool?.source).toBe('builtin');
    });

    it('should return null for unknown tool', () => {
      const tool = getTool('nonexistent_tool');
      expect(tool).toBeNull();
    });
  });

  describe('executeTool', () => {
    it('should throw for unknown tool', async () => {
      await expect(executeTool('nonexistent_tool', {})).rejects.toThrow('Tool not found');
    });

    it('should execute run_shell tool', async () => {
      const result = (await executeTool('run_shell', { command: 'echo "hello"' })) as {
        stdout: string;
        stderr: string;
        exitCode: number;
      };
      expect(result.stdout.trim()).toBe('hello');
      expect(result.exitCode).toBe(0);
    });

    it('should handle run_shell with non-zero exit', async () => {
      const result = (await executeTool('run_shell', { command: 'exit 1' })) as {
        stdout: string;
        stderr: string;
        exitCode: number;
      };
      expect(result.exitCode).toBe(1);
    });

    it('should pass workspace context to run_shell', async () => {
      const result = (await executeTool(
        'run_shell',
        { command: 'pwd' },
        { workspacePath: '/' }
      )) as {
        stdout: string;
        exitCode: number;
      };
      expect(result.stdout.trim()).toBe('/');
      expect(result.exitCode).toBe(0);
    });
  });
});

describe('tools - handlers', () => {
  describe('run_shell handler', () => {
    it('should handle timeout option', async () => {
      const result = (await executeTool('run_shell', {
        command: 'echo "fast"',
        timeout: 5000,
      })) as { stdout: string; exitCode: number };
      expect(result.stdout.trim()).toBe('fast');
    });

    it('should capture stderr', async () => {
      const result = (await executeTool('run_shell', { command: 'echo "error" >&2' })) as {
        stderr: string;
        exitCode: number;
      };
      expect(result.stderr.trim()).toBe('error');
      expect(result.exitCode).toBe(0);
    });
  });
});
