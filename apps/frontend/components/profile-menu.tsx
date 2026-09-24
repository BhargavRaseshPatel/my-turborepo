'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/lib/api/auth';
import { useAuth } from './auth-provider';

type ProfileMenuProps = {
  isAdmin: boolean;
  organizationName: string;
  onAddMember: (email: string) => Promise<void>;
};

export function ProfileMenu({ isAdmin, organizationName, onAddMember }: ProfileMenuProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        if (isMounted) {
          setUser(response.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const username = user?.username ?? 'User';
    return username
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsAdding(true);
    setMessage('');
    try {
      await onAddMember(email.trim());
      setEmail('');
      setMessage('Invitation sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add user.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth-screen');
  };

  return (
    <aside className="profile-panel" aria-label="Profile information">
      <div className="profile-header">
        <div className="avatar size-12 text-sm">{initials}</div>
        <div>
          <strong className="block text-slate-900">{user?.username ?? 'User'}</strong>
          <span className="profile-role">{user?.email ?? 'Authenticated user'}</span>
        </div>
      </div>
      <div className="profile-details">
        <span>Current organization</span>
        <strong className="text-sm text-slate-800">{organizationName}</strong>
      </div>

      {isAdmin ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <p className="admin-title">Organization admin</p>
          <label className="form-label-compact" htmlFor="member-email">Add a user</label>
          <div className="flex items-center gap-2">
            <input
              id="member-email"
              className="member-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              required
            />
            <button className="member-button" type="submit" disabled={isAdding}>
              {isAdding ? '...' : 'Add'}
            </button>
          </div>
          {message && <p className="profile-message">{message}</p>}
        </form>
      ) : (
        <p className="profile-note">Only organization admins can add users.</p>
      )}

      <button className="logout-button" type="button" onClick={handleLogout}>
        Log out
      </button>
    </aside>
  );
}
