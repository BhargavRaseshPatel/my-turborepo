'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BOARD_API, ORG_API } from '@repo/config';

type Board = {
  id: string;
  name: string;
  description: string;
};

type Organization = {
  id: string;
  name: string;
  description?: string;
  role?: string;
  boards?: Board[];
};

const normalizeBoard = (board: any): Board => ({
  id: String(board.id ?? board._id ?? board.boardId ?? `${board.name ?? 'board'}-${Math.random()}`),
  name: board.name ?? 'Untitled board',
  description: board.description ?? '',
});

const normalizeOrganization = (item: any): Organization => ({
  id: String(item.id ?? item._id ?? item.organizationId ?? item.name ?? 'org-1'),
  name: item.name ?? 'Untitled organization',
  description: item.description ?? '',
  role: item.role ?? 'Owner',
  boards: Array.isArray(item.boards)
    ? item.boards.map((board: any) => normalizeBoard(board))
    : [],
});

const fetchOrganizations = async (): Promise<Organization[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  try {
    const response = await fetch(ORG_API.list, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error('Failed to load organizations');
    }

    const data = await response.json();
    const items = Array.isArray(data)
      ? data
      : data.organizations ?? data.organization ?? data.data ?? [];

    return Array.isArray(items) ? items.map(normalizeOrganization) : [];
  } catch (error) {
    console.warn(`Could not fetch organizations from ${ORG_API.list}:`, error);
    return [];
  }
};

const fetchBoards = async (): Promise<Record<string, Board[]>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  try {
    const response = await fetch(BOARD_API.list, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error('Failed to load boards');
    }

    const data = await response.json();
    const boards = Array.isArray(data)
      ? data
      : data.boards ?? data.board ?? data.data ?? [];

    const groupedBoards = (Array.isArray(boards) ? boards : []).reduce<Record<string, Board[]>>((acc, board) => {
      const orgId = String(board.organizationId ?? board.orgId ?? board.organization?.id ?? '');
      if (!orgId) return acc;

      acc[orgId] = [...(acc[orgId] ?? []), normalizeBoard(board)];
      return acc;
    }, {});

    return groupedBoards;
  } catch (error) {
    console.warn(`Could not fetch boards from ${BOARD_API.list}:`, error);
    return {};
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBoardCreateOpen, setIsBoardCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBoardSubmitting, setIsBoardSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [boardFormData, setBoardFormData] = useState({ name: '' });
  const [allBoards, setAllBoards] = useState<Record<string, Board[]>>({});

  const loadOrganizations = async () => {
    setIsLoading(true);

    try {
      const orgs = await fetchOrganizations();
      const groupedBoards = await fetchBoards();
      setAllBoards(groupedBoards);
      const organizationsWithBoards = orgs.map((organization) => ({
        ...organization,
        boards: groupedBoards[String(organization.id)] ?? organization.boards ?? [],
      }));

      setOrganizations(organizationsWithBoards);

      if (organizationsWithBoards.length > 0) {
        setSelectedOrgId((current) => current || String(organizationsWithBoards[0].id));
      } else {
        setSelectedOrgId('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (!organizations.length) return;

    setOrganizations((current) =>
      current.map((organization) => ({
        ...organization,
        boards: allBoards[String(organization.id)] ?? organization.boards ?? [],
      }))
    );
  }, [allBoards]);

  const activeOrganization = useMemo(
    () => organizations.find((organization) => String(organization.id) === String(selectedOrgId)) ?? organizations[0],
    [organizations, selectedOrgId]
  );

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name || !description) {
      alert('Organization name and description are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(ORG_API.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create organization');
      }

      const createdOrganization = normalizeOrganization(data.organization ?? data.data ?? data);
      setOrganizations((current) => [createdOrganization, ...current]);
      setSelectedOrgId(String(createdOrganization.id));
      setFormData({ name: '', description: '' });
      setIsCreateOpen(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBoard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOrgId) {
      alert('Please select an organization first');
      return;
    }

    const name = boardFormData.name.trim();

    if (!name) {
      alert('Board name is required');
      return;
    }

    setIsBoardSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(BOARD_API.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          organizationId: selectedOrgId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create board');
      }

      const createdBoard = normalizeBoard(data.board ?? data.data ?? data);
      setAllBoards((current) => ({
        ...current,
        [String(selectedOrgId)]: [...(current[String(selectedOrgId)] ?? []), createdBoard],
      }));
      setOrganizations((current) =>
        current.map((organization) =>
          String(organization.id) === String(selectedOrgId)
            ? {
                ...organization,
                boards: [...(organization.boards ?? []), createdBoard],
              }
            : organization
        )
      );
      setBoardFormData({ name: '' });
      setIsBoardCreateOpen(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsBoardSubmitting(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-toolbar">
          <span className="dashboard-toolbar-label">Organizations</span>

          {organizations.length > 1 ? (
            <select
              className="dashboard-select"
              value={selectedOrgId}
              onChange={(event) => setSelectedOrgId(event.target.value)}
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="dashboard-pill">{activeOrganization?.name ?? 'No organizations'}</div>
          )}
        </div>

        <button type="button" className="dashboard-primary-btn" onClick={() => setIsCreateOpen(true)}>
          + New Organization
        </button>
      </header>

      {isCreateOpen && (
        <div className="dashboard-form-card">
          <h3>Create new organization</h3>

          <form className="dashboard-form" onSubmit={handleCreateOrganization}>
            <div>
              <label className="dashboard-field-label" htmlFor="org-name">
                Organization name
              </label>
              <input
                id="org-name"
                className="dashboard-input"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="My Company"
              />
            </div>

            <div>
              <label className="dashboard-field-label" htmlFor="org-description">
                Description
              </label>
              <textarea
                id="org-description"
                className="dashboard-textarea"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe your organization"
                rows={4}
              />
            </div>

            <div className="dashboard-actions">
              <button type="button" className="dashboard-secondary-btn" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="dashboard-primary-btn"
                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-panel">
          <p className="dashboard-panel-title">Selected organization</p>
          {isLoading ? (
            <p className="dashboard-org-meta">Loading organizations...</p>
          ) : (
            <>
              <h2 className="dashboard-org-name">{activeOrganization?.name ?? 'No organization selected'}</h2>
              <p className="dashboard-org-description">
                {activeOrganization?.description || 'No description available.'}
              </p>
              <p className="dashboard-org-meta">Role: {activeOrganization?.role ?? 'Owner'}</p>
            </>
          )}
        </div>

        <div style={{ marginTop: '24px' }}>
          <div className="dashboard-section-header">
            <h3>Boards</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="dashboard-count">{(activeOrganization?.boards?.length ?? 0)} boards</span>
              <button type="button" className="dashboard-primary-btn" onClick={() => setIsBoardCreateOpen(true)}>
                + Create Board
              </button>
            </div>
          </div>

          {isBoardCreateOpen && (
            <div className="dashboard-form-card" style={{ marginTop: 0, marginBottom: '20px' }}>
              <h3>Create new board</h3>

              <form className="dashboard-form" onSubmit={handleCreateBoard}>
                <div>
                  <label className="dashboard-field-label" htmlFor="board-name">
                    Board name
                  </label>
                  <input
                    id="board-name"
                    className="dashboard-input"
                    value={boardFormData.name}
                    onChange={(event) => setBoardFormData({ name: event.target.value })}
                    placeholder="Sprint Planning"
                  />
                </div>

                <div className="dashboard-actions">
                  <button type="button" className="dashboard-secondary-btn" onClick={() => setIsBoardCreateOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBoardSubmitting}
                    className="dashboard-primary-btn"
                    style={{ cursor: isBoardSubmitting ? 'not-allowed' : 'pointer', opacity: isBoardSubmitting ? 0.7 : 1 }}
                  >
                    {isBoardSubmitting ? 'Creating...' : 'Create Board'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="board-grid">
            {activeOrganization?.boards && activeOrganization.boards.length > 0 ? (
              activeOrganization.boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => router.push(`/organization/${selectedOrgId}/board/${board.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/organization/${selectedOrgId}/board/${board.id}`);
                    }
                  }}
                  className="board-card"
                >
                  <div className="board-card-top">
                    <h4>{board.name}</h4>
                    <span className="board-card-badge">Board</span>
                  </div>

                  <p className="board-card-description">{board.description}</p>
                </div>
              ))
            ) : (
              <div className="empty-state-card">No boards available in this organization.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
