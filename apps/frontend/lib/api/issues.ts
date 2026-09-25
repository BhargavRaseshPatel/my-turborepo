import { ISSUE_API } from '@repo/config';
import { apiRequest } from './client';
import type { Issue, IssueStatus, IssueTag, OrganizationMember } from '../types';

export type CreateIssuePayload = {
  name: string;
  description: string;
  boardId: string;
  status: IssueStatus;
  tag: IssueTag;
  memberIds: string[];
};

const normalizeIssue = (item: any): Issue => ({
  ...item,
  members: Array.isArray(item?.issueMappings)
    ? item.issueMappings.map((mapping: any): OrganizationMember => ({
        id: String(mapping.user?.id ?? mapping.userId),
        username: mapping.user?.username ?? 'Unknown user',
        email: mapping.user?.email ?? '',
      }))
    : item?.members ?? [],
});

export async function listIssuesByBoard(boardId: string): Promise<Issue[]> {
  const data = await apiRequest<{ issues?: Issue[] }>(`${ISSUE_API.listByBoard}/${boardId}`);
  return Array.isArray(data.issues) ? data.issues.map(normalizeIssue) : [];
}

export async function createIssue(payload: CreateIssuePayload): Promise<Issue> {
  const data = await apiRequest<{ issue?: Issue }>(ISSUE_API.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.issue ? normalizeIssue(data.issue) : {
    id: Date.now().toString(),
    ...payload,
    members: [],
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
