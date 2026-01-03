import { type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps {
  columns?: number | string;
  rows?: string;
  gap?: number | SpacingToken;
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

/**
 * Grid - CSS Grid layout component
 *
 * Purpose: Replace className grid strings with type-safe props
 * Features: Columns, rows, gap configuration
 *
 * @example
 * <Grid columns={3} gap="lg">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 */
export const Grid = ({ columns, rows, gap, className, children }: GridProps): React.JSX.Element => (
  <div
    className={cn('grid', gap && typeof gap !== 'number' && spacingMap[gap], className)}
    style={{
      ...(columns !== undefined && {
        gridTemplateColumns:
          typeof columns === 'number' ? `repeat(${String(columns)}, 1fr)` : columns,
      }),
      ...(rows && { gridTemplateRows: rows }),
      ...(typeof gap === 'number' && { gap: `${String(gap)}px` }),
    }}
  >
    {children}
  </div>
);
