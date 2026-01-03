import { useEffect, useRef } from 'react';
import { cn } from '../lib/utils.js';

// ============================================================================
// Dropdown Component
// ============================================================================

export interface DropdownProps {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Trigger element (button) */
  trigger: React.ReactNode;
  /** Dropdown content */
  children: React.ReactNode;
  /** Position relative to trigger */
  position?: 'top' | 'bottom';
  /** Alignment relative to trigger */
  align?: 'start' | 'end' | 'center';
  /** Additional CSS classes for the menu */
  className?: string;
  /** Width of the dropdown */
  width?: 'trigger' | 'auto' | number;
}

/**
 * Dropdown - Popover menu component
 *
 * Provides consistent dropdown menus with backdrop.
 *
 * @example
 * <Dropdown
 *   trigger={<Button variant="ghost">{selectedModel.name}</Button>}
 *   isOpen={open}
 *   onOpenChange={setOpen}
 *   position="top"
 * >
 *   <DropdownLabel>Model</DropdownLabel>
 *   <DropdownItem onClick={() => select('opus')}>opus-4-5</DropdownItem>
 *   <DropdownDivider />
 *   <DropdownItem onClick={() => select('sonnet')}>sonnet-4</DropdownItem>
 * </Dropdown>
 */
export const Dropdown = ({
  isOpen,
  onOpenChange,
  trigger,
  children,
  position = 'bottom',
  align = 'start',
  className,
  width = 'auto',
}: DropdownProps): React.JSX.Element => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  const positionClasses = position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';

  const alignClasses =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  const widthClasses =
    width === 'trigger' ? 'left-0 right-0' : width === 'auto' ? 'w-56' : undefined;

  const widthStyle = typeof width === 'number' ? { width: `${String(width)}px` } : undefined;

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => {
              onOpenChange(false);
            }}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute z-[60] rounded-md border border-border bg-sidebar shadow-lg',
              positionClasses,
              alignClasses,
              widthClasses,
              className
            )}
            style={widthStyle}
          >
            <div className="p-1">{children}</div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// DropdownLabel Component
// ============================================================================

export interface DropdownLabelProps {
  /** Label text */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DropdownLabel - Section label in dropdown
 */
export const DropdownLabel = ({ children, className }: DropdownLabelProps): React.JSX.Element => (
  <div className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}>
    {children}
  </div>
);

// ============================================================================
// DropdownItem Component
// ============================================================================

export interface DropdownItemProps {
  /** Click handler */
  onClick?: () => void;
  /** Whether the item is selected */
  selected?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether to use destructive styling */
  destructive?: boolean;
  /** Item content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DropdownItem - Clickable item in dropdown
 */
export const DropdownItem = ({
  onClick,
  selected,
  disabled,
  destructive,
  children,
  className,
}: DropdownItemProps): React.JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
      'transition-colors text-left',
      'focus:outline-none focus:bg-accent',
      destructive
        ? 'text-destructive hover:bg-destructive/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
      selected && 'bg-accent/50',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
  >
    {children}
  </button>
);

// ============================================================================
// DropdownDivider Component
// ============================================================================

/**
 * DropdownDivider - Horizontal separator in dropdown
 */
export const DropdownDivider = (): React.JSX.Element => (
  <div className="my-1 border-t border-border" />
);
