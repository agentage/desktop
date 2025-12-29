import { Outlet } from 'react-router-dom';
import { TitleBar } from '../components/TitleBar.js';

/**
 * Layout for unauthenticated users (login/signup screens)
 *
 * Purpose: Full-page branded experience for login flow
 * Structure: TitleBar + centered content area + footer
 */
export const LoginLayout = (): React.JSX.Element => (
  <div>
    <TitleBar title="Agentage" showLogo={false} dark={true} />
    <Outlet />
    <footer>
      <span>v1.0.0</span>
      <span>•</span>
      <button onClick={() => void window.agentage.app.openExternal('https://dev.agentage.io')}>
        agentage.io
      </button>
    </footer>
  </div>
);
