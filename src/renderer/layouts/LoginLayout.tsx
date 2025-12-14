import { Outlet } from 'react-router-dom';
import { TitleBar } from '../components/TitleBar.js';

/**
 * Layout for unauthenticated users (login/signup screens)
 * Full-page branded experience with dark theme
 */
export const LoginLayout = (): React.JSX.Element => (
  <div className="start-page">
    {/* Custom titlebar (dark variant for start page) */}
    <div className="start-page-titlebar">
      <TitleBar title="Agentage" showLogo={false} dark={true} />
    </div>

    {/* Page content from nested routes */}
    <Outlet />

    {/* Footer - positioned bottom right */}
    <div className="start-footer">
      <span className="version">v1.0.0</span>
      <span className="separator">•</span>
      <button
        className="link"
        onClick={() => void window.agentage.app.openExternal('https://dev.agentage.io')}
      >
        agentage.io
      </button>
    </div>

    {/* Background decoration */}
    <div className="start-bg-decoration">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="grid-pattern" />
    </div>
  </div>
);
