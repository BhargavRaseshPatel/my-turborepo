'use client';

import { useRouter } from 'next/navigation';

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

  const handleBoardChange = (nextBoardId: string) => {
    const nextBoard = boards.find((board) => board.id === nextBoardId);
    if (nextBoard) {
      router.push(`/organization/${nextBoard.organizationId}/board/${nextBoard.id}`);
    }
  };

  return (
    <header className="board-header">
      <div>
        <p className="board-eyebrow">Project workspace</p>
        <h1 className="board-heading">{organizationName}</h1>
        <p className="mt-2 text-base font-bold text-slate-600">{boardName}</p>
      </div>

      <div className="board-actions">
        {boards.length > 0 && (
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="hidden sm:inline">Board</span>
            <select
              className="board-switcher"
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
          <span className="avatar">BP</span>
          <span className="board-profile">
            <strong className="text-sm text-slate-900">Bhargav</strong>
            <small className="text-[11px] text-slate-500">Account</small>
          </span>
          <span className="text-slate-400" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  );
}
