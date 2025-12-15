import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountSection } from '../components/features/settings/index.js';
import { useAuth } from '../hooks/index.js';
import '../styles/settings.css';

/**
 * Account page - displays user account information
 * Route: /account
 * Content only - rendered inside AppLayout
 */
export const AccountPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = (): void => {
    logout()
      .then(() => navigate('/login'))
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="settings-page loading">
        <div className="settings-loading">Loading account...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-page error">
        <div className="settings-error">Failed to load account</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <AccountSection
          user={user}
          authProvider="Google" // TODO: Get actual provider
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};
