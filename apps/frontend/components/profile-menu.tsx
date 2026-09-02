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
    <aside className="profile-menu" aria-label="Profile information">
      <div className="profile-menu-header">
        <div className="profile-avatar profile-avatar-large">BP</div>
        <div>
          <strong>Bhargav</strong>
          <span>Product Lead</span>
        </div>
      </div>
      <div className="profile-menu-detail">
        <span>Current organization</span>
        <strong>{organizationName}</strong>
      </div>

      {isAdmin ? (
        <form className="member-form" onSubmit={handleSubmit}>
          <p className="member-form-title">Organization admin</p>
          <label className="field-label" htmlFor="member-email">Add a user</label>
          <div className="member-form-row">
            <input
              id="member-email"
              className="text-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              required
            />
            <button className="primary-button" type="submit" disabled={isAdding}>
              {isAdding ? '...' : 'Add'}
            </button>
          </div>
          {message && <p className="profile-menu-message">{message}</p>}
        </form>
      ) : (
        <p className="profile-menu-note">Only organization admins can add users.</p>
      )}
    </aside>
  );
}
