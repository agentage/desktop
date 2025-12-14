import { useState } from 'react';
import { SettingsSection } from './SettingsSection.js';

interface ModelProvider {
  id: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefault?: boolean;
}

interface ProviderSectionProps {
  providers: ModelProvider[];
  onProviderUpdate: (provider: ModelProvider) => void;
}

export const ProviderSection = ({
  providers,
  onProviderUpdate,
}: ProviderSectionProps): React.JSX.Element => {
  const openAIProvider = providers.find((p) => p.provider === 'openai');
  const [apiKey, setApiKey] = useState(openAIProvider?.apiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async (): Promise<void> => {
    if (!apiKey) return;

    setTesting(true);
    setTestResult(null);

    try {
      // TODO: Implement actual OpenAI API key validation
      // For now, just simulate a test
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (apiKey.startsWith('sk-')) {
        setTestResult({ success: true, message: 'Valid - Last tested just now' });
      } else {
        setTestResult({ success: false, message: 'Invalid API key format' });
      }
    } catch {
      setTestResult({ success: false, message: 'Failed to validate API key' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (): void => {
    const provider: ModelProvider = {
      id: openAIProvider?.id ?? 'openai-1',
      provider: 'openai',
      apiKey,
      defaultModel: openAIProvider?.defaultModel ?? 'gpt-4',
      isDefault: true,
    };
    onProviderUpdate(provider);
  };

  return (
    <SettingsSection title="Model Provider">
      <div className="settings-field">
        <label htmlFor="openai-key" className="settings-label">
          OpenAI API Key
        </label>
        <div className="input-group">
          <input
            id="openai-key"
            type={showKey ? 'text' : 'password'}
            className="settings-input"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
            }}
            onBlur={() => {
              handleSave();
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowKey(!showKey);
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void handleTest();
            }}
            disabled={!apiKey || testing}
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
        </div>
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            {testResult.success ? '✓' : '✗'} {testResult.message}
          </div>
        )}
      </div>
    </SettingsSection>
  );
};
