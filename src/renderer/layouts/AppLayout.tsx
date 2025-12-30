import { Outlet } from 'react-router-dom';
import { Sidebar, TitleBar } from '../components/index.js';

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + Content area (right)
 * Contains the main navigation and content rendering area
 */
export const AppLayout = (): React.JSX.Element => (
  <div className="flex h-screen flex-col bg-background">
    {/* Title bar at top */}
    <TitleBar title="Agentage" showLogo={true} dark={true} />

    {/* Main content area: sidebar + content */}
    <main className="flex flex-1 overflow-hidden">
      <Sidebar />

      {/* Content area */}
      <section className="flex flex-1 flex-col overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="flex h-8 items-center justify-between border-t border-border bg-sidebar px-4">
          <span className="text-xs text-muted-foreground">© 2024 Agentage</span>
          <span className="text-xs text-muted-foreground">v0.1.0</span>
        </footer>
      </section>
    </main>
  </div>
);
