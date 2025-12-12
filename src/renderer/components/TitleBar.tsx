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
  // Use userAgentData if available (modern approach)
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform.toLowerCase() === 'macos';
  }
  // Fallback to userAgent string
  return nav.userAgent.toLowerCase().includes('mac');
};

/**
 * Custom draggable titlebar with window controls (VS Code style)
 * Works cross-platform: Linux, macOS, Windows
 *
 * Use `simple={true}` for screens where IPC may not be available (error, loading)
 */
export const TitleBar = ({
  title = 'Agentage',
  showLogo = true,
  simple = false,
  dark = false,
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

    // Check maximized state on window resize
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
    <header className={`titlebar${dark ? ' titlebar--dark' : ''}`}>
      {/* macOS: controls on left */}
      {isMac && (
        <div className="titlebar-controls titlebar-controls--mac">
          <button
            className="titlebar-btn titlebar-btn--close"
            onClick={handleClose}
            title="Close"
            type="button"
          >
            <span className="titlebar-btn-icon">×</span>
          </button>
          <button
            className="titlebar-btn titlebar-btn--minimize"
            onClick={handleMinimize}
            title="Minimize"
            type="button"
          >
            <span className="titlebar-btn-icon">−</span>
          </button>
          <button
            className="titlebar-btn titlebar-btn--maximize"
            onClick={() => void handleMaximize()}
            title={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
          >
            <span className="titlebar-btn-icon">{isMaximized ? '⧉' : '+'}</span>
          </button>
        </div>
      )}

      {/* Logo */}
      {showLogo && (
        <div className="titlebar-logo">
          <div className="titlebar-logo-icon">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <span className="titlebar-title">{title}</span>
        </div>
      )}

      {/* Drag region (fills remaining space) */}
      <div className="titlebar-drag-region" />

      {/* Windows/Linux: controls on right */}
      {!isMac && (
        <div className="titlebar-controls titlebar-controls--win">
          <button
            className="titlebar-btn titlebar-btn--minimize"
            onClick={handleMinimize}
            title="Minimize"
            type="button"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0 5h10v1H0z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="titlebar-btn titlebar-btn--maximize"
            onClick={() => void handleMaximize()}
            title={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M2 0v2H0v8h8V8h2V0H2zm6 8H1V3h7v5zm1-6H3V1h6v5h-1V2z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            className="titlebar-btn titlebar-btn--close"
            onClick={handleClose}
            title="Close"
            type="button"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 0L0 1l4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4-1-1-4 4-4-4z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};
