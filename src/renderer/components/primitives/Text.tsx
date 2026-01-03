import { type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextVariant = 'default' | 'muted' | 'primary' | 'destructive';
type TextAlign = 'left' | 'center' | 'right';

export interface TextProps {
  size?: TextSize;
  weight?: TextWeight;
  variant?: TextVariant;
  align?: TextAlign;
  truncate?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

const sizeMap: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightMap: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const variantMap: Record<TextVariant, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  destructive: 'text-destructive',
};

const alignMap: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Text - Typography component
 *
 * Purpose: Replace className text strings with type-safe props
 * Features: Size, weight, color variants, alignment, truncation
 *
 * @example
 * <Text size="2xl" weight="semibold">Active Agents</Text>
 * <Text size="xs" variant="muted">Available agent definitions</Text>
 */
export const Text = ({
  size = 'base',
  weight = 'normal',
  variant = 'default',
  align,
  truncate,
  as: Component = 'span',
  className,
  children,
}: TextProps): React.JSX.Element => (
  <Component
    className={cn(
      sizeMap[size],
      weightMap[weight],
      variantMap[variant],
      align && alignMap[align],
      truncate && 'truncate',
      className
    )}
  >
    {children}
  </Component>
);
