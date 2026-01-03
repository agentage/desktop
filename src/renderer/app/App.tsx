import { Outlet } from 'react-router-dom';

/**
 * Root application component
 * Minimal - just renders the router outlet
 * All routing logic is handled by router.tsx
 */
export const App = (): React.JSX.Element => <Outlet />;
