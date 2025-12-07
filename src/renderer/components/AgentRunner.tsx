import { useState } from 'react';

interface AgentRunnerProps {
  agentName: string;
}

export const AgentRunner = ({ agentName }: AgentRunnerProps): React.JSX.Element => {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setRunning(true);
    setError(null);
    setOutput('');

    try {
      const result = await window.agentage.agents.run(agentName, prompt);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run agent');
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleRun();
    }
  };

  return (
    <div className="agent-runner">
      <h2>{agentName}</h2>

      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt..."
          disabled={running}
          rows={4}
        />
        <button onClick={() => void handleRun()} disabled={running || !prompt.trim()} type="button">
          {running ? 'Running...' : 'Run Agent'}
        </button>
        <p className="shortcut-hint">Ctrl+Enter to run</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {output && (
        <div className="output-section">
          <h3>Output</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};
