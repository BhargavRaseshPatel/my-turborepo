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
        <p className="eyebrow">Project workspace</p>
        <h1>{organizationName}</h1>
        <p className="board-title">{boardName}</p>
      </div>

      <div className="header-actions">
        {boards.length > 0 && (
          <label className="board-switcher-label">
            <span>Board</span>
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

        <button className="profile-button" type="button" onClick={onProfileClick} aria-label="Open profile menu">
          <span className="profile-avatar">BP</span>
          <span className="profile-button-copy">
            <strong>Bhargav</strong>
            <small>Account</small>
          </span>
          <span className="profile-chevron" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  );
}
