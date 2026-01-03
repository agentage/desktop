import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/utils.js';

export const Avatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>): React.JSX.Element => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
);

export const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>): React.JSX.Element => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn('aspect-square size-full', className)}
    {...props}
  />
);

export const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>): React.JSX.Element => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
    {...props}
  />
);
