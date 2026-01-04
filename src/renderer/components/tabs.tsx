import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/utils.js';

/**
 * Tabs - Tab navigation component
 *
 * Uses Radix UI Tabs for accessible tab interface.
 * Styled to match the application design system.
 */
export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>): React.JSX.Element => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex items-center justify-start gap-1 text-muted-foreground',
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.JSX.Element => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground',
      'data-[state=active]:border-b-2 data-[state=active]:border-primary',
      'hover:text-foreground',
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
);

export const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): React.JSX.Element => (
  <TabsPrimitive.Content
    className={cn(
      'flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      className
    )}
    {...props}
  />
);
