import { TitleBar } from '../components/TitleBar.js';

interface LoadingLayoutProps {
  message?: string;
}

/**
 * Layout for loading states (app initialization, auth checks, etc.)
 *
 * Purpose: Full-screen loading display while app initializes
 * Features: App branding, loading spinner, status message
 */
export const LoadingLayout = ({
  message = 'Loading...',
}: LoadingLayoutProps): React.JSX.Element => (
  <div>
    <TitleBar title="Agentage" showLogo={false} simple={true} />
    <div>
      <h1>Agentage</h1>
      <p>{message}</p>
    </div>
  </div>
);
