import { cn } from '../lib/utils.js';

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Error message to display */
  error?: string;
  /** Hint/help text */
  hint?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Form field input/control */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormField - Form label + input wrapper
 *
 * Provides consistent form field layout with label, error, and hint.
 *
 * @example
 * <FormField label="Backend URL" error={urlError}>
 *   <Input value={url} onChange={setUrl} placeholder="https://..." />
 * </FormField>
 */
export const FormField = ({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps): React.JSX.Element => (
  <div className={cn('space-y-1.5', className)}>
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

// ============================================================================
// Input Component (Enhanced)
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error state */
  error?: boolean;
}

/**
 * Input - Enhanced text input with error state
 *
 * @example
 * <Input
 *   value={value}
 *   onChange={handleChange}
 *   error={!!urlError}
 *   placeholder="Enter value..."
 * />
 */
export const Input = ({ error, className, ...props }: InputProps): React.JSX.Element => (
  <input
    className={cn(
      'h-9 w-full rounded-md border bg-muted/30 px-3 text-sm transition-all duration-200',
      'placeholder:text-muted-foreground/60 focus:outline-none',
      'focus:border-ring focus:ring-2 focus:ring-ring/20 focus:bg-background',
      error ? 'border-destructive' : 'border-border',
      props.disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    {...props}
  />
);

// ============================================================================
// Textarea Component
// ============================================================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea has an error state */
  error?: boolean;
}

/**
 * Textarea - Enhanced textarea with error state
 *
 * @example
 * <Textarea
 *   value={value}
 *   onChange={handleChange}
 *   rows={4}
 *   placeholder="Enter description..."
 * />
 */
export const Textarea = ({ error, className, ...props }: TextareaProps): React.JSX.Element => (
  <textarea
    className={cn(
      'w-full rounded-md border bg-muted/30 px-3 py-2 text-sm transition-all duration-200',
      'placeholder:text-muted-foreground/60 focus:outline-none resize-none',
      'focus:border-ring focus:ring-2 focus:ring-ring/20 focus:bg-background',
      error ? 'border-destructive' : 'border-border',
      props.disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    {...props}
  />
);
