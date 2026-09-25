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
  liveCount: number;
  onProfileClick: () => void;
};

export function BoardHeader({
  organizationName,
  boardName,
  boardId,
  boards,
  liveCount,
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
        {liveCount > 0 && (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"
            title={`${liveCount} ${liveCount === 1 ? 'person is' : 'people are'} viewing this board`}
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            {liveCount} live
          </span>
        )}

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
