import { cn } from '../lib/utils.js';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div
    data-slot="card"
    className={cn(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div
    data-slot="card-header"
    className={cn('grid auto-rows-min grid-cols-[1fr_auto] items-start gap-2 px-6', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props}>
    {children}
  </div>
);

export const CardDescription = ({
  className,
  children,
  ...props
}: CardProps): React.JSX.Element => (
  <div
    data-slot="card-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardAction = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div
    data-slot="card-action"
    className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div data-slot="card-content" className={cn('px-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: CardProps): React.JSX.Element => (
  <div
    data-slot="card-footer"
    className={cn('flex flex-col items-start gap-1.5 px-6', className)}
    {...props}
  >
    {children}
  </div>
);
