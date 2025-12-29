import { Outlet } from 'react-router-dom';
import { Sidebar, TitleBar } from '../components/index.js';

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + Content area (right)
 * Contains the main navigation and content rendering area
 */
export const AppLayout = (): React.JSX.Element => (
  <div>
    <TitleBar title="" showLogo={true} dark={true} />
    <main>
      <Sidebar />
      <section>
        <Outlet />
      </section>
    </main>
  </div>
);
