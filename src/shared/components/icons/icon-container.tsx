import { cn } from '../../lib/utils.js';

/**
 * Color variants for icon containers
 */
export type IconContainerColor = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'muted';

/**
 * Size variants for icon containers
 */
export type IconContainerSize = 'sm' | 'md' | 'lg';

const colorVariants: Record<IconContainerColor, string> = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-green-500/10 text-green-500',
  amber: 'bg-amber-500/10 text-amber-500',
  violet: 'bg-violet-500/10 text-violet-500',
  rose: 'bg-rose-500/10 text-rose-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
  muted: 'bg-muted/50 text-muted-foreground',
};

const sizeVariants: Record<IconContainerSize, string> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
};

export interface IconContainerProps {
  /** Color variant for the container */
  color: IconContainerColor;
  /** Size variant */
  size?: IconContainerSize;
  /** Icon element to render inside */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * IconContainer - Colored wrapper for icons
 *
 * Provides consistent colored backgrounds for icons across the app.
 *
 * @example
 * <IconContainer color="blue">
 *   <UserIcon />
 * </IconContainer>
 */
export const IconContainer = ({
  color,
  size = 'md',
  children,
  className,
}: IconContainerProps): React.JSX.Element => (
  <div
    className={cn(
      'flex items-center justify-center rounded-md',
      colorVariants[color],
      sizeVariants[size],
      className
    )}
  >
    {children}
  </div>
);
