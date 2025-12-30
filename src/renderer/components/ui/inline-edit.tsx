import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { IconButton } from './icon-button.js';
import { CheckIcon, EditIcon, XIcon } from './icons.js';

export interface InlineEditProps {
  /** Current value */
  value: string;
  /** Callback when value is saved */
  onSave: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Validation function - returns error message or null */
  validate?: (value: string) => string | null;
  /** Whether editing is disabled */
  disabled?: boolean;
  /** Text display className */
  displayClassName?: string;
  /** Input className */
  inputClassName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * InlineEdit - Editable text field
 *
 * Click to edit text inline with save/cancel buttons.
 *
 * @example
 * <InlineEdit
 *   value={name}
 *   onSave={handleSave}
 *   placeholder="Enter name..."
 * />
 */
export const InlineEdit = ({
  value,
  onSave,
  placeholder,
  validate,
  disabled,
  displayClassName,
  inputClassName,
  className,
}: InlineEditProps): React.JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback((): void => {
    const trimmed = editValue.trim();

    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }

    setIsEditing(false);
    setError(null);
  }, [editValue, value, validate, onSave]);

  const handleCancel = useCallback((): void => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (disabled) {
    return (
      <span className={cn('text-sm text-foreground', displayClassName, className)}>{value}</span>
    );
  }

  if (isEditing) {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleCancel}
            placeholder={placeholder}
            className={cn(
              'flex-1 px-2 py-1 text-sm border rounded bg-background text-foreground',
              'focus:outline-none focus:border-primary',
              error ? 'border-destructive' : 'border-border',
              inputClassName
            )}
          />
          <IconButton
            icon={<CheckIcon />}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={handleSave}
            className="text-green-500 hover:bg-green-500/10"
            title="Save"
          />
          <IconButton
            icon={<XIcon />}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={handleCancel}
            title="Cancel"
          />
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      <span className={cn('flex-1 text-sm text-foreground truncate', displayClassName)}>
        {value}
      </span>
      <IconButton
        icon={<EditIcon />}
        onClick={() => {
          setIsEditing(true);
        }}
        className="opacity-0 group-hover:opacity-100"
        title="Edit"
      />
    </div>
  );
};
