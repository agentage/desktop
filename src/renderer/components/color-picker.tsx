import { cn } from '../lib/utils.js';

export interface ColorOption {
  /** Unique identifier */
  id: string;
  /** CSS color value */
  value: string;
  /** Display label */
  label: string;
}

export interface ColorPickerProps {
  /** Currently selected color id */
  value: string;
  /** Callback when color changes */
  onChange: (id: string) => void;
  /** Available colors */
  colors: ColorOption[];
  /** Size of color buttons */
  size?: 'sm' | 'md';
  /** Number of columns */
  columns?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ColorPicker - Color selection component
 *
 * @example
 * <ColorPicker
 *   value={selectedColor}
 *   onChange={setSelectedColor}
 *   colors={[
 *     { id: 'blue', value: '#3B82F6', label: 'Blue' },
 *     { id: 'green', value: '#22C55E', label: 'Green' },
 *   ]}
 * />
 */
export const ColorPicker = ({
  value,
  onChange,
  colors,
  size = 'md',
  columns,
  className,
}: ColorPickerProps): React.JSX.Element => {
  const sizeClass = size === 'sm' ? 'size-4' : 'size-[18px]';

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))` }
    : {};

  return (
    <div
      className={cn('flex flex-wrap gap-2', columns && 'grid', className)}
      style={columns ? gridStyle : undefined}
    >
      {colors.map((color) => (
        <button
          key={color.id}
          type="button"
          title={color.label}
          onClick={() => {
            onChange(color.id);
          }}
          className={cn(
            sizeClass,
            'rounded-full transition-all duration-200',
            'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            value === color.id && 'ring-2 ring-offset-2 ring-offset-sidebar'
          )}
          style={
            {
              backgroundColor: color.value,
              '--tw-ring-color': value === color.id ? color.value : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

// ============================================================================
// Preset color palettes
// ============================================================================

/** Standard accent colors */
export const ACCENT_COLORS: ColorOption[] = [
  { id: 'blue', value: '#3B82F6', label: 'Blue' },
  { id: 'purple', value: '#8B5CF6', label: 'Purple' },
  { id: 'green', value: '#22C55E', label: 'Green' },
  { id: 'orange', value: '#F97316', label: 'Orange' },
  { id: 'pink', value: '#EC4899', label: 'Pink' },
  { id: 'cyan', value: '#06B6D4', label: 'Cyan' },
];

/** Workspace colors (10 colors) */
export const WORKSPACE_COLORS: ColorOption[] = [
  { id: 'slate', value: '#64748b', label: 'Slate' },
  { id: 'red', value: '#ef4444', label: 'Red' },
  { id: 'orange', value: '#f97316', label: 'Orange' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
  { id: 'yellow', value: '#eab308', label: 'Yellow' },
  { id: 'lime', value: '#84cc16', label: 'Lime' },
  { id: 'green', value: '#22c55e', label: 'Green' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
];
