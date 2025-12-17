import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgentConfig {
  name: string;
  model: string;
  temperature: number;
  tools: string[];
  description: string;
  instructions: string;
}

const DEFAULT_CONFIG: AgentConfig = {
  name: '',
  model: 'gpt-4o',
  temperature: 0.7,
  tools: [],
  description: '',
  instructions: `# Agent Name

You are a helpful assistant.

## Your responsibilities:

1. Help users with their tasks
2. Provide accurate information
3. Be concise and clear

## Output format:

- Use markdown formatting
- Be structured and organized
`,
};

const AVAILABLE_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Anthropic)' },
];

const AVAILABLE_TOOLS = [
  { value: 'github', label: '🐙 GitHub' },
  { value: 'filesystem', label: '📁 Filesystem' },
  { value: 'web-browser', label: '🌐 Web Browser' },
  { value: 'slack', label: '💬 Slack' },
];

/**
 * New Agent page - create a new agent with config and instructions
 * Route: /agents/new
 */
export const NewAgentPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBack = (): void => {
    void navigate('/');
  };

  const updateConfig = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]): void => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTool = (tool: string): void => {
    setConfig((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const generateAgentFile = (): string => {
    const yaml = [
      '---',
      `name: "${config.name || 'my-agent'}"`,
      `model: ${config.model}`,
      `temperature: ${String(config.temperature)}`,
    ];

    if (config.tools.length > 0) {
      yaml.push('tools:');
      config.tools.forEach((tool) => {
        yaml.push(`  - ${tool}`);
      });
    }

    if (config.description) {
      yaml.push(`description: "${config.description}"`);
    }

    yaml.push('---');
    yaml.push('');
    yaml.push(config.instructions);

    return yaml.join('\n');
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(generateAgentFile());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API may fail
    }
  };

  const isValid = config.name.trim().length > 0 && /^[a-z0-9-]+$/.test(config.name);

  return (
    <div className="new-agent-page">
      <header className="new-agent-header">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← Back
        </button>
        <h1>Create New Agent</h1>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setShowPreview(!showPreview);
            }}
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>
      </header>

      {showPreview ? (
        <section className="agent-preview">
          <div className="preview-header">
            <span className="preview-filename">{config.name || 'my-agent'}.agent.md</span>
            <button type="button" className="btn-icon" onClick={() => void handleCopy()}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <pre className="preview-content">{generateAgentFile()}</pre>
          <div className="preview-instructions">
            <p>Save this file to:</p>
            <code>~/.agentage/agents/{config.name || 'my-agent'}.agent.md</code>
          </div>
        </section>
      ) : (
        <div className="agent-editor">
          <section className="editor-config">
            <h2>Configuration</h2>

            <div className="form-group">
              <label htmlFor="agent-name">Agent Name *</label>
              <input
                id="agent-name"
                type="text"
                value={config.name}
                onChange={(e) => {
                  updateConfig('name', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                placeholder="my-agent"
                className={config.name && !isValid ? 'invalid' : ''}
              />
              <span className="form-hint">Lowercase letters, numbers, and hyphens only</span>
            </div>

            <div className="form-group">
              <label htmlFor="agent-description">Description</label>
              <input
                id="agent-description"
                type="text"
                value={config.description}
                onChange={(e) => {
                  updateConfig('description', e.target.value);
                }}
                placeholder="A helpful assistant for..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="agent-model">Model</label>
              <select
                id="agent-model"
                value={config.model}
                onChange={(e) => {
                  updateConfig('model', e.target.value);
                }}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="agent-temperature">Temperature: {String(config.temperature)}</label>
              <input
                id="agent-temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => {
                  updateConfig('temperature', parseFloat(e.target.value));
                }}
              />
              <span className="form-hint">Lower = more focused, Higher = more creative</span>
            </div>

            <div className="form-group">
              <label>Tools</label>
              <div className="tools-grid">
                {AVAILABLE_TOOLS.map((tool) => (
                  <button
                    key={tool.value}
                    type="button"
                    className={`tool-chip ${config.tools.includes(tool.value) ? 'selected' : ''}`}
                    onClick={() => {
                      toggleTool(tool.value);
                    }}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="editor-instructions">
            <h2>Instructions (Markdown)</h2>
            <textarea
              value={config.instructions}
              onChange={(e) => {
                updateConfig('instructions', e.target.value);
              }}
              placeholder="# Agent Name&#10;&#10;You are a helpful assistant..."
              spellCheck={false}
            />
          </section>
        </div>
      )}

      <footer className="new-agent-footer">
        <div className="footer-hint">
          <span>💡</span>
          <span>
            Agents are saved as <code>.agent.md</code> files in <code>~/.agentage/agents/</code>
          </span>
        </div>
        <div className="footer-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!isValid}
            onClick={() => {
              setShowPreview(true);
            }}
          >
            Generate File
          </button>
        </div>
      </footer>
    </div>
  );
};
