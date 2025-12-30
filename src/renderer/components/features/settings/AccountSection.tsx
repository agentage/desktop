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

/**
 * Account settings section
 * 
 * Purpose: Display current user info, logout functionality
 * Features: User avatar/initials, name, email, auth provider, logout button
 */
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
      <div>
        <div>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name ?? user.email} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          {user.name && <div>{user.name}</div>}
          <div>{user.email}</div>
          {authProvider && <div>Signed in with {authProvider}</div>}
        </div>
        <button onClick={onLogout}>Log Out</button>
      </div>
    </SettingsSection>
  );
};
