import type { IssueFormData } from './issue-create-form';

type Issue = {
  id: string;
  name: string;
  description: string;
  status?: IssueFormData['status'];
  tag: IssueFormData['tag'];
};

type IssueCardProps = {
  issue: Issue;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onDelete: () => void;
  onMove: (direction: 'left' | 'right') => void;
};

export function IssueCard({
  issue,
  canMoveLeft,
  canMoveRight,
  onDelete,
  onMove,
}: IssueCardProps) {
  const tagLabel = issue.tag
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character: string) => character.toUpperCase());

  return (
    <article className="issue-card">
      <div className="issue-card-meta">
        <span className="status-pill">{tagLabel}</span>
        <span className="text-[11px] text-slate-500">#{issue.id.slice(0, 6)}</span>
      </div>
      <h3 className="issue-card-title">{issue.name}</h3>
      <p className="issue-card-description">{issue.description}</p>
      <div className="issue-card-actions">
        <button className="delete-issue-button" type="button" onClick={onDelete}>
          Delete
        </button>
        <div className="issue-move-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => onMove('left')}
            disabled={!canMoveLeft}
            aria-label={`Move ${issue.name} to the previous status`}
          >
            &lt;
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onMove('right')}
            disabled={!canMoveRight}
            aria-label={`Move ${issue.name} to the next status`}
          >
            &gt;
          </button>
        </div>
      </div>
    </article>
  );
}
