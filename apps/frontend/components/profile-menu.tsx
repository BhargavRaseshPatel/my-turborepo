'use client';

import { useState } from 'react';

type ProfileMenuProps = {
  isAdmin: boolean;
  organizationName: string;
  onAddMember: (email: string) => Promise<void>;
};

export function ProfileMenu({ isAdmin, organizationName, onAddMember }: ProfileMenuProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <aside className="profile-panel" aria-label="Profile information">
      <div className="profile-header">
        <div className="avatar size-12 text-sm">BP</div>
        <div>
          <strong className="block text-slate-900">Bhargav</strong>
          <span className="profile-role">Product Lead</span>
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
    </aside>
  );
}
