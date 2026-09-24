import { ISSUE_API } from '@repo/config';
import { apiRequest } from './client';
import type { Issue, IssueStatus } from '../types';

export type CreateIssuePayload = {
  name: string;
  description: string;
  boardId: string;
  status: IssueStatus;
};

export async function listIssuesByBoard(boardId: string): Promise<Issue[]> {
  const data = await apiRequest<{ issues?: Issue[] }>(`${ISSUE_API.listByBoard}/${boardId}`);
  return Array.isArray(data.issues) ? data.issues : [];
}

export async function createIssue(payload: CreateIssuePayload): Promise<Issue> {
  const data = await apiRequest<{ issue?: Issue }>(ISSUE_API.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.issue ?? {
    id: Date.now().toString(),
    ...payload,
  };
}

export function updateIssueStatus(issueId: string, status: IssueStatus) {
  return apiRequest<{ issue?: Issue }>(`${ISSUE_API.base}/updateIssue/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function deleteIssue(issueId: string) {
  return apiRequest<{ message?: string }>(`${ISSUE_API.base}/${issueId}`, {
    method: 'DELETE',
  });
}
