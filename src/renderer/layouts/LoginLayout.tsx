import { Outlet } from 'react-router-dom';
import { TitleBar } from './components/TitleBar.js';

/**
 * Layout for unauthenticated users (login/signup screens)
 *
 * Purpose: Full-page branded experience for login flow
 * Structure: TitleBar + centered content area + footer
 */
export const LoginLayout = (): React.JSX.Element => (
  <div className="flex h-screen flex-col bg-background">
    <TitleBar title="Agentage" showLogo={false} dark={true} />
    <main className="flex flex-1 items-center justify-center">
      <Outlet />
    </main>
    <footer className="flex h-8 items-center justify-center gap-2 border-t border-border bg-sidebar px-4">
      <span className="text-xs text-muted-foreground">v0.1.0</span>
      <span className="text-xs text-muted-foreground">•</span>
      <button
        onClick={() => void window.agentage.app.openExternal('https://dev.agentage.io')}
        className="text-xs text-primary hover:underline"
      >
        agentage.io
      </button>
    </footer>
  </div>
);
