import { useCallback, useEffect, useState } from 'react';
import { cn } from '../lib/utils.js';

interface TitleBarProps {
  title?: string;
  showLogo?: boolean;
  /** Use simple mode without IPC calls (for error/loading screens) */
  simple?: boolean;
  /** Use dark theme variant (for dark backgrounds like login screen) */
  dark?: boolean;
}

/**
 * Detect if running on macOS
 */
const isMacOS = (): boolean => {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform.toLowerCase() === 'macos';
  }
  return nav.userAgent.toLowerCase().includes('mac');
};

/**
 * Custom draggable titlebar with window controls
 *
 * Purpose: Cross-platform window title bar with minimize/maximize/close controls
 * Features:
 *   - macOS: traffic light buttons on left
 *   - Windows/Linux: standard buttons on right
 *   - Drag region for window movement
 *   - Optional logo display
 */
export const TitleBar = ({
  title = 'Agentage',
  showLogo = true,
  simple = false,
}: TitleBarProps): React.JSX.Element => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isMac = isMacOS();

  const checkMaximized = useCallback(async (): Promise<void> => {
    if (simple) return;
    try {
      const maximized = await window.agentage.window.isMaximized();
      setIsMaximized(maximized);
    } catch {
      // IPC not available, ignore
    }
  }, [simple]);

  useEffect(() => {
    if (simple) return;

    void checkMaximized();

    const handleResize = (): void => {
      void checkMaximized();
    };
    window.addEventListener('resize', handleResize);
    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  }, [checkMaximized, simple]);

  const handleMinimize = (): void => {
    if (simple) return;
    void window.agentage.window.minimize();
  };

  const handleMaximize = async (): Promise<void> => {
    if (simple) return;
    await window.agentage.window.maximize();
    await checkMaximized();
  };

  const handleClose = (): void => {
    if (simple) return;
    void window.agentage.window.close();
  };

  // Windows 10 style button - taller, narrower rectangle
  const winButtonBase = cn(
    'flex h-full w-12 items-center justify-center',
    'text-muted-foreground transition-colors',
    'hover:bg-card hover:text-foreground',
    'focus:outline-none'
  );

  // macOS traffic light style - small circles
  const macButtonBase = cn(
    'flex h-3 w-3 items-center justify-center rounded-full',
    'text-[8px] leading-none transition-colors',
    'focus:outline-none'
  );

  return (
    <header
      className={cn('flex h-8 items-center border-b border-border bg-sidebar', 'select-none')}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS: controls on left */}
      {isMac && (
        <div
          className="flex items-center gap-2 px-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleClose}
            title="Close"
            type="button"
            className={cn(macButtonBase, 'bg-destructive hover:brightness-110')}
          >
            <span className="opacity-0 hover:opacity-100">×</span>
          </button>
          <button
            onClick={handleMinimize}
            title="Minimize"
            type="button"
            className={cn(macButtonBase, 'bg-warning hover:brightness-110')}
          >
            <span className="opacity-0 hover:opacity-100">−</span>
          </button>
          <button
            onClick={() => void handleMaximize()}
            title={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
            className={cn(macButtonBase, 'bg-success hover:brightness-110')}
          >
            <span className="opacity-0 hover:opacity-100">+</span>
          </button>
        </div>
      )}

      {/* Logo */}
      {showLogo && (
        <div className="flex items-center gap-2 px-3">
          <span className="text-xs font-medium text-foreground">{title}</span>
        </div>
      )}

      {/* Drag region (fills remaining space) */}
      <div className="flex-1" />

      {/* Windows/Linux: controls on right - Windows 10 style */}
      {!isMac && (
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={handleMinimize} title="Minimize" type="button" className={winButtonBase}>
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={() => void handleMaximize()}
            title={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
            className={winButtonBase}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                <rect x="2" y="0" width="8" height="8" strokeWidth="1" />
                <rect
                  x="0"
                  y="2"
                  width="8"
                  height="8"
                  strokeWidth="1"
                  fill="var(--color-sidebar)"
                />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
              </svg>
            )}
          </button>
          <button
            onClick={handleClose}
            title="Close"
            type="button"
            className={cn(winButtonBase, 'hover:bg-destructive hover:text-white')}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <path d="M0 0L10 10M10 0L0 10" strokeWidth="1" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};
