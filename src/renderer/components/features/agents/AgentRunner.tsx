import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgentRunnerProps {
  agentName: string;
}

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'tool';
  message: string;
}

const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
};

export const AgentRunner = ({ agentName }: AgentRunnerProps): React.JSX.Element => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const addLog = (type: LogEntry['type'], message: string): void => {
    setLogs((prev) => [...prev, { time: formatTime(), type, message }]);
  };

  const handleRun = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setRunning(true);
    setError(null);
    setOutput('');
    setLogs([]);

    addLog('success', 'Agent started');
    addLog('info', `Agent: ${agentName}`);

    try {
      addLog('tool', 'Executing agent...');
      const result = await window.agentage.agents.run(agentName, prompt);
      setOutput(result);
      addLog('success', 'Complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run agent';
      setError(errorMessage);
      addLog('error', errorMessage);
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleRun();
    }
  };

  const handleBack = (): void => {
    void navigate('/');
  };

  const handleStop = (): void => {
    // TODO: Implement agent cancellation
    setRunning(false);
    addLog('info', 'Stopped by user');
  };

  const handleCopy = async (): Promise<void> => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  };

  return (
    <div className="agent-runner">
      <header className="runner-header">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← Back
        </button>
        <h1>Running: {agentName}</h1>
        {running && (
          <button type="button" className="btn-stop" onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
      </header>

      <section className="runner-input">
        <label htmlFor="prompt-input">INPUT</label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt..."
          disabled={running}
          rows={4}
        />
        <div className="input-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleRun()}
            disabled={running || !prompt.trim()}
          >
            {running ? '⏳ Running...' : '▶ Execute'}
          </button>
          <span className="shortcut-hint">Ctrl+Enter to run</span>
        </div>
      </section>

      {logs.length > 0 && (
        <section className="runner-logs">
          <label>EXECUTION LOG</label>
          <div className="log-container">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry log-${log.type}`}>
                <span className="log-time">[{log.time}]</span>
                <span className="log-icon">
                  {log.type === 'success' && '✓'}
                  {log.type === 'info' && 'ℹ'}
                  {log.type === 'error' && '✗'}
                  {log.type === 'tool' && '⚡'}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
            {running && <div className="log-entry log-running">⏳ Processing...</div>}
          </div>
        </section>
      )}

      {error && (
        <section className="runner-error">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </section>
      )}

      {output && (
        <section className="runner-output">
          <div className="output-header">
            <label>OUTPUT</label>
            <div className="output-actions">
              <button
                type="button"
                className="btn-icon"
                onClick={() => void handleCopy()}
                title="Copy to clipboard"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div className="output-content">
            <pre>{output}</pre>
          </div>
        </section>
      )}
    </div>
  );
};
