import { type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface StackProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: number | SpacingToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  flex?: number;
  className?: string;
  children: ReactNode;
}

const spacingMap: Record<SpacingToken, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

/**
 * Stack - Simplified flexbox for vertical/horizontal stacking
 *
 * Purpose: Common pattern for stacking elements with consistent spacing
 * Default: Vertical stack with auto spacing
 *
 * @example
 * <Stack spacing="md">
 *   <Text size="lg">Title</Text>
 *   <Text variant="muted">Description</Text>
 * </Stack>
 */
export const Stack = ({
  direction = 'vertical',
  spacing,
  align,
  justify,
  flex,
  className,
  children,
}: StackProps): React.JSX.Element => (
  <div
    className={cn(
      'flex',
      direction === 'horizontal' ? 'flex-row' : 'flex-col',
      spacing && (typeof spacing === 'number' ? '' : spacingMap[spacing]),
      align && alignMap[align],
      justify && justifyMap[justify],
      className
    )}
    style={{
      ...(typeof spacing === 'number' && { gap: `${String(spacing)}px` }),
      ...(flex !== undefined && { flex }),
    }}
  >
    {children}
  </div>
);
