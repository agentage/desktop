import { type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FlexProps {
  direction?: 'row' | 'column';
  gap?: number | SpacingToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  flex?: number;
  as?: ElementType;
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
 * Flex - Flexbox layout component
 *
 * Purpose: Replace className flexbox strings with type-safe props
 * Features: Direction, gap, align, justify, wrap
 *
 * @example
 * <Flex direction="row" gap="sm" align="center">
 *   <Icon name="bot" />
 *   <Text>Active Agents</Text>
 * </Flex>
 */
export const Flex = ({
  direction = 'row',
  gap,
  align,
  justify,
  wrap,
  flex,
  as: Component = 'div',
  className,
  children,
}: FlexProps): React.JSX.Element => (
  <Component
    className={cn(
      'flex',
      direction === 'column' && 'flex-col',
      gap && (typeof gap === 'number' ? '' : spacingMap[gap]),
      align && alignMap[align],
      justify && justifyMap[justify],
      wrap && 'flex-wrap',
      className
    )}
    style={{
      ...(typeof gap === 'number' && { gap: `${String(gap)}px` }),
      ...(flex !== undefined && { flex }),
    }}
  >
    {children}
  </Component>
);
