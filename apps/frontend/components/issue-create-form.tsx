'use client';

import type { FormEvent } from 'react';
import type { IssueTag, OrganizationMember } from '../lib/types';

export type IssueFormData = {
  name: string;
  description: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'DONE';
  tag: IssueTag;
  memberIds: string[];
};

const issueTagOptions: Array<{ value: IssueTag; label: string }> = [
  { value: 'DESIGN', label: 'Design' },
  { value: 'FRONTEND_CODING', label: 'Frontend coding' },
  { value: 'BACKEND_CODING', label: 'Backend coding' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'BUG', label: 'Bug' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'FEATURE', label: 'Feature' },
];

type IssueCreateFormProps = {
  formData: IssueFormData;
  isSubmitting: boolean;
  members: OrganizationMember[];
  onChange: (formData: IssueFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function IssueCreateForm({
  formData,
  isSubmitting,
  members,
  onChange,
  onSubmit,
  onCancel,
}: IssueCreateFormProps) {
  const toggleMember = (memberId: string) => {
    const selected = formData.memberIds.includes(memberId)
      ? formData.memberIds.filter((id) => id !== memberId)
      : [...formData.memberIds, memberId];
    onChange({ ...formData, memberIds: selected });
  };

  return (
    <section className="issue-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <form
        className="issue-modal"
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-form-title"
      >
        <div className="issue-form-header">
          <div>
            <p className="form-kicker">New work item</p>
            <h2 id="issue-form-title" className="text-xl font-extrabold text-slate-900">Add issue</h2>
          </div>
          <button className="form-close-button" type="button" onClick={onCancel} aria-label="Close add issue form">
            ×
          </button>
        </div>

        <div className="issue-form-grid">
          <div>
            <label className="form-label-compact" htmlFor="issue-name">Issue name</label>
            <input
              id="issue-name"
              className="form-input-compact"
              value={formData.name}
              onChange={(event) => onChange({ ...formData, name: event.target.value })}
              placeholder="Write task title"
              required
            />
          </div>

          <div>
            <label className="form-label-compact" htmlFor="issue-tag">Tag</label>
            <select
              id="issue-tag"
              className="form-input-compact"
              value={formData.tag}
              onChange={(event) => onChange({ ...formData, tag: event.target.value as IssueTag })}
            >
              {issueTagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label-compact" htmlFor="issue-status">Status</label>
            <select
              id="issue-status"
              className="form-input-compact"
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
          <label className="form-label-compact" htmlFor="issue-description">Description</label>
          <textarea
            id="issue-description"
            className="form-input-compact min-h-24 resize-y"
            value={formData.description}
            onChange={(event) => onChange({ ...formData, description: event.target.value })}
            placeholder="Describe the issue"
            rows={4}
            required
          />
        </div>

        <div className="mt-4">
          <label className="form-label-compact">Assign members</label>
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">No members in this organization yet.</p>
          ) : (
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {members.map((member) => (
                <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                  />
                  <span className="font-medium text-slate-800">{member.username}</span>
                  {member.email && <span className="text-slate-400">({member.email})</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <button className="button-gradient mt-5" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Issue'}
        </button>
      </form>
    </section>
  );
}
