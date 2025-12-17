import '../styles/pages/home-page.css';

/**
 * Home page - displays empty state prompting user to select an agent
 * Route: /
 * Content only - rendered inside AppLayout
 */
export const HomePage = (): React.JSX.Element => (
  <div className="empty-state empty-state--dark">
    <div className="empty-state-content">
      <p>Select an agent to get started</p>
    </div>
  </div>
);
