import type { IssueFormData } from './issue-create-form';

type Issue = {
  id: string;
  name: string;
  description: string;
  status?: IssueFormData['status'];
};

type IssueCardProps = {
  issue: Issue;
  statusTitle: string;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMove: (direction: 'left' | 'right') => void;
};

export function IssueCard({
  issue,
  statusTitle,
  canMoveLeft,
  canMoveRight,
  onMove,
}: IssueCardProps) {
  return (
    <article className="issue-card">
      <div className="issue-top-row">
        <span className="issue-tag">{statusTitle}</span>
        <span className="issue-meta">#{issue.id.slice(0, 6)}</span>
      </div>
      <h3>{issue.name}</h3>
      <p className="issue-description">{issue.description}</p>
      <div className="issue-card-actions">
        <button
          className="issue-move-button"
          type="button"
          onClick={() => onMove('left')}
          disabled={!canMoveLeft}
          aria-label={`Move ${issue.name} to the previous status`}
        >
          &lt;
        </button>
        <button
          className="issue-move-button"
          type="button"
          onClick={() => onMove('right')}
          disabled={!canMoveRight}
          aria-label={`Move ${issue.name} to the next status`}
        >
          &gt;
        </button>
      </div>
    </article>
  );
}
