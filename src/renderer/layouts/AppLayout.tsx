import { Outlet } from 'react-router-dom';
import { Sidebar, TitleBar } from '../components/index.js';

/**
 * Main application layout for authenticated users
 * Contains TitleBar, Sidebar, and content area
 */
export const AppLayout = (): React.JSX.Element => (
  <div className="app">
    <TitleBar title="" showLogo={true} dark={true} />

    <main className="app-main">
      <Sidebar />

      <section className="content">
        <Outlet />
      </section>
    </main>
  </div>
);
