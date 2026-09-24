'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/lib/api/auth';

export type BoardOption = {
  id: string;
  name: string;
  organizationId: string;
};

type BoardHeaderProps = {
  organizationName: string;
  boardName: string;
  boardId: string;
  boards: BoardOption[];
  onProfileClick: () => void;
};

export function BoardHeader({
  organizationName,
  boardName,
  boardId,
  boards,
  onProfileClick,
}: BoardHeaderProps) {
  const router = useRouter();
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

  const handleBoardChange = (nextBoardId: string) => {
    const nextBoard = boards.find((board) => board.id === nextBoardId);
    if (nextBoard) {
      router.push(`/organization/${nextBoard.organizationId}/board/${nextBoard.id}`);
    }
  };

  return (
    <header className="board-header">
      <div className="board-identity">
        {/* <button className="board-back-button" type="button" onClick={() => router.push('/dashboard')} aria-label="Back to dashboard">
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <span className="board-brand-mark" aria-label="Trello">T</span> */}
        <div className="board-heading-group">
          <h1 className="board-heading">{organizationName}</h1>
          <p className="mt-2 text-base font-bold text-slate-600">{boardName}</p>
        </div>
      </div>

      <div className="board-actions">
        {boards.length > 0 && (
          <label className="dropdown-label">
            <span className="hidden sm:inline">Board</span>
            <select
              className="dropdown-select"
              value={boardId}
              onChange={(event) => handleBoardChange(event.target.value)}
              aria-label="Change board"
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button className="profile-menu-trigger" type="button" onClick={onProfileClick} aria-label="Open profile menu">
          <span className="avatar">{initials}</span>
          <span className="board-profile">
            <strong className="text-sm text-slate-900">{user?.username ?? 'User'}</strong>
            <small className="text-[11px] text-slate-500">{user?.email ?? 'Account'}</small>
          </span>
          <span className="text-slate-400" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  );
}
