import { SettingsSection } from './SettingsSection.js';

interface AccountSectionProps {
  user: {
    name?: string;
    email: string;
    avatar?: string;
  };
  authProvider?: string;
  onLogout: () => void;
}

export const AccountSection = ({
  user,
  authProvider,
  onLogout,
}: AccountSectionProps): React.JSX.Element => {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <SettingsSection title="Account">
      <div className="account-info">
        <div className="account-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name ?? user.email} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="account-details">
          {user.name && <div className="account-name">{user.name}</div>}
          <div className="account-email">{user.email}</div>
          {authProvider && <div className="account-provider">Signed in with {authProvider}</div>}
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </SettingsSection>
  );
};
