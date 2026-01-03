import { cn } from '../lib/utils.js';

/**
 * Variant styles for icon buttons
 */
export type IconButtonVariant = 'default' | 'ghost' | 'destructive';

/**
 * Size variants for icon buttons
 */
export type IconButtonSize = 'sm' | 'md';

const variantStyles: Record<IconButtonVariant, string> = {
  default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent',
  destructive: 'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'p-1',
  md: 'p-1.5',
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element to render */
  icon: React.ReactNode;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Size variant */
  size?: IconButtonSize;
}

/**
 * IconButton - Icon-only button for actions
 *
 * Consistent styling for icon buttons used in toolbars, cards, etc.
 *
 * @example
 * <IconButton icon={<EditIcon />} onClick={handleEdit} title="Edit" />
 * <IconButton icon={<TrashIcon />} variant="destructive" onClick={handleRemove} />
 */
export const IconButton = ({
  icon,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}: IconButtonProps): React.JSX.Element => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      'rounded transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      variantStyles[variant],
      sizeStyles[size],
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    {...props}
  >
    {icon}
  </button>
);
