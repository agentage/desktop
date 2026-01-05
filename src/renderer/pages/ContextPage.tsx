import { useEffect, useState } from 'react';
import { Button, FileTextIcon, FormField, Textarea } from '../components/index.js';

/**
 * ContextPage - System prompt management
 *
 * Purpose: Manage system prompt for agent context
 * Features: Edit and save system prompt to context.json
 */
export const ContextPage = (): React.JSX.Element => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load context data on mount
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const data = await window.agentage.contextData.load();
        setSystemPrompt(data.systemPrompt);
      } catch (error) {
        console.error('Failed to load context data:', error);
      }
    };
    void loadData();
  }, []);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await window.agentage.contextData.save({ systemPrompt });
      setSaveMessage('Saved successfully');
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save context data:', error);
      setSaveMessage('Failed to save');
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 h-full">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <FileTextIcon />
          </div>
          <h1 className="text-base font-semibold text-foreground">Context</h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <FormField label="System Prompt" hint="Enter the system prompt for agent context">
            <Textarea
              value={systemPrompt}
              onChange={(e): void => {
                setSystemPrompt(e.target.value);
              }}
              rows={12}
              placeholder="Enter system prompt..."
              disabled={isSaving}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <Button
              onClick={(): void => {
                void handleSave();
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.includes('success') ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
