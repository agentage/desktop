import { useCallback, useEffect, useState } from 'react';

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

  return (
    <header>
      {/* macOS: controls on left */}
      {isMac && (
        <div>
          <button onClick={handleClose} title="Close" type="button">×</button>
          <button onClick={handleMinimize} title="Minimize" type="button">−</button>
          <button onClick={() => void handleMaximize()} title={isMaximized ? 'Restore' : 'Maximize'} type="button">
            {isMaximized ? '⧉' : '+'}
          </button>
        </div>
      )}

      {/* Logo */}
      {showLogo && (
        <div>
          <span>{title}</span>
        </div>
      )}

      {/* Drag region (fills remaining space) */}
      <div />

      {/* Windows/Linux: controls on right */}
      {!isMac && (
        <div>
          <button onClick={handleMinimize} title="Minimize" type="button">−</button>
          <button onClick={() => void handleMaximize()} title={isMaximized ? 'Restore' : 'Maximize'} type="button">
            {isMaximized ? '⧉' : '□'}
          </button>
          <button onClick={handleClose} title="Close" type="button">×</button>
        </div>
      )}
    </header>
  );
};
