import { cn } from '../../lib/utils.js';

export interface ToggleOption<T extends string> {
  /** Option value */
  value: T;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

export interface ToggleGroupProps<T extends string> {
  /** Currently selected value */
  value: T;
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Available options */
  options: ToggleOption<T>[];
  /** Number of columns (default: options.length) */
  columns?: 2 | 3 | 4;
  /** Whether to show icons above labels */
  vertical?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ToggleGroup - Option selection component
 *
 * Single selection from a group of options.
 *
 * @example
 * <ToggleGroup
 *   value={theme}
 *   onChange={setTheme}
 *   options={[
 *     { value: 'light', label: 'Light', icon: <SunIcon /> },
 *     { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
 *     { value: 'system', label: 'System', icon: <MonitorIcon /> },
 *   ]}
 *   columns={3}
 * />
 */
export const ToggleGroup = <T extends string>({
  value,
  onChange,
  options,
  columns,
  vertical = false,
  className,
}: ToggleGroupProps<T>): React.JSX.Element => {
  const gridCols = columns ?? options.length;
  const gridClass =
    gridCols === 2
      ? 'grid-cols-2'
      : gridCols === 3
        ? 'grid-cols-3'
        : gridCols === 4
          ? 'grid-cols-4'
          : 'grid-cols-3';

  return (
    <div className={cn('grid gap-2', gridClass, className)}>
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          selected={value === option.value}
          onClick={() => {
            onChange(option.value);
          }}
          vertical={vertical}
        >
          {option.icon}
          <span>{option.label}</span>
        </ToggleButton>
      ))}
    </div>
  );
};

// ============================================================================
// ToggleButton Component
// ============================================================================

export interface ToggleButtonProps {
  /** Whether the button is selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Whether to stack icon and label vertically */
  vertical?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ToggleButton - Individual toggle option button
 *
 * Can be used standalone or as part of ToggleGroup.
 *
 * @example
 * <ToggleButton selected={isSelected} onClick={handleClick}>
 *   <SunIcon />
 *   <span>Light</span>
 * </ToggleButton>
 */
export const ToggleButton = ({
  selected,
  onClick,
  vertical = false,
  children,
  className,
}: ToggleButtonProps): React.JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      selected
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground border border-border',
      vertical && 'flex-col gap-1 py-1.5',
      className
    )}
  >
    {children}
  </button>
);
