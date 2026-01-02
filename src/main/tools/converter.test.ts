import { describe, expect, it } from '@jest/globals';
import { toAnthropicTool, toAnthropicTools } from './converter.js';
import type { ToolDefinition } from './types.js';

describe('Tool Converter', () => {
  const mockTool: ToolDefinition = {
    name: 'test_tool',
    description: 'A test tool for unit testing',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results', default: 10 },
      },
      required: ['query'],
    },
  };

  describe('toAnthropicTool', () => {
    it('should convert a tool definition to Anthropic format', () => {
      const result = toAnthropicTool(mockTool);

      expect(result).toEqual({
        name: 'test_tool',
        description: 'A test tool for unit testing',
        input_schema: mockTool.inputSchema,
      });
    });

    it('should preserve all inputSchema properties', () => {
      const result = toAnthropicTool(mockTool);

      expect(result.input_schema.type).toBe('object');
      expect(result.input_schema.properties).toEqual(mockTool.inputSchema.properties);
      expect(result.input_schema.required).toEqual(['query']);
    });

    it('should handle tool with minimal schema', () => {
      const minimalTool: ToolDefinition = {
        name: 'minimal',
        description: 'Minimal tool',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      const result = toAnthropicTool(minimalTool);

      expect(result.name).toBe('minimal');
      expect(result.description).toBe('Minimal tool');
      expect(result.input_schema.type).toBe('object');
    });
  });

  describe('toAnthropicTools', () => {
    it('should convert multiple tools to Anthropic format', () => {
      const tools: ToolDefinition[] = [
        mockTool,
        {
          name: 'another_tool',
          description: 'Another test tool',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string' },
            },
            required: ['url'],
          },
        },
      ];

      const result = toAnthropicTools(tools);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test_tool');
      expect(result[1].name).toBe('another_tool');
    });

    it('should return empty array for empty input', () => {
      const result = toAnthropicTools([]);
      expect(result).toEqual([]);
    });

    it('should convert all tools (ToolDefinition type ensures required fields)', () => {
      // Note: ToolDefinition type requires name, description, and inputSchema
      // So filtering is not needed - TypeScript enforces valid input
      const tools = [mockTool];

      const result = toAnthropicTools(tools);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test_tool');
    });
  });
});
