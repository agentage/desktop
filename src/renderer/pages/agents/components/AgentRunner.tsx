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

/**
 * Agent runner component
 * 
 * Purpose: Execute agent with user prompt, display results
 * Features: Prompt input, execution control, log display, output display,
 *           copy to clipboard, keyboard shortcuts
 */
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
    setRunning(false);
    addLog('info', 'Stopped by user');
  };

  const handleCopy = async (): Promise<void> => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch {
      // Clipboard API may fail
    }
  };

  return (
    <div>
      <header>
        <button type="button" onClick={handleBack}>← Back</button>
        <h1>Running: {agentName}</h1>
        {running && <button type="button" onClick={handleStop}>Stop</button>}
      </header>

      <section>
        <label htmlFor="prompt-input">INPUT</label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt..."
          disabled={running}
          rows={4}
        />
        <div>
          <button
            type="button"
            onClick={() => void handleRun()}
            disabled={running || !prompt.trim()}
          >
            {running ? 'Running...' : 'Execute'}
          </button>
          <span>Ctrl+Enter to run</span>
        </div>
      </section>

      {logs.length > 0 && (
        <section>
          <label>EXECUTION LOG</label>
          <div>
            {logs.map((log, index) => (
              <div key={index}>
                <span>[{log.time}]</span>
                <span>{log.message}</span>
              </div>
            ))}
            {running && <div>Processing...</div>}
          </div>
        </section>
      )}

      {error && (
        <section>
          <div>⚠️ {error}</div>
        </section>
      )}

      {output && (
        <section>
          <div>
            <label>OUTPUT</label>
            <button type="button" onClick={() => void handleCopy()}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre>{output}</pre>
        </section>
      )}
    </div>
  );
};
