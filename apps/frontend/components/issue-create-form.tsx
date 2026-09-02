'use client';

import type { FormEvent } from 'react';

export type IssueFormData = {
  name: string;
  description: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'DONE';
};

type IssueCreateFormProps = {
  formData: IssueFormData;
  isSubmitting: boolean;
  onChange: (formData: IssueFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function IssueCreateForm({
  formData,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: IssueCreateFormProps) {
  return (
    <section className="issue-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <form
        className="issue-form issue-modal"
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-form-title"
      >
        <div className="issue-form-header">
          <div>
            <p className="form-kicker">New work item</p>
            <h2 id="issue-form-title">Add issue</h2>
          </div>
          <button className="form-close-button" type="button" onClick={onCancel} aria-label="Close add issue form">
            ×
          </button>
        </div>

        <div className="issue-form-grid">
          <div>
            <label className="field-label" htmlFor="issue-name">Issue name</label>
            <input
              id="issue-name"
              className="text-input"
              value={formData.name}
              onChange={(event) => onChange({ ...formData, name: event.target.value })}
              placeholder="Write task title"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="issue-status">Status</label>
            <select
              id="issue-status"
              className="text-input"
              value={formData.status}
              onChange={(event) => onChange({ ...formData, status: event.target.value as IssueFormData['status'] })}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="issue-description">Description</label>
          <textarea
            id="issue-description"
            className="text-area"
            value={formData.description}
            onChange={(event) => onChange({ ...formData, description: event.target.value })}
            placeholder="Describe the issue"
            rows={4}
            required
          />
        </div>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Issue'}
        </button>
      </form>
    </section>
  );
}
