import { ORG_API } from '@repo/config';
import { apiRequest } from './client';
import type { Organization } from '../types';

const normalizeOrganization = (item: any): Organization => ({
  id: String(item.id ?? item._id ?? item.organizationId ?? item.name ?? 'org-1'),
  name: item.name ?? 'Untitled organization',
  description: item.description ?? '',
  role: item.role ?? 'Owner',
  adminId: item.adminId,
  boards: Array.isArray(item.boards) ? item.boards : [],
});

export async function listOrganizations(): Promise<Organization[]> {
  const data = await apiRequest<any>(ORG_API.list);
  const items = Array.isArray(data) ? data : data.organizations ?? data.organization ?? data.data ?? [];
  return Array.isArray(items) ? items.map(normalizeOrganization) : [];
}

export async function createOrganization(name: string, description: string): Promise<Organization> {
  const data = await apiRequest<any>(ORG_API.create, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });

  return normalizeOrganization(data.organization ?? data.data ?? data);
}
