'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createBoard, listBoards } from '@/lib/api/boards';
import { createOrganization, listOrganizations } from '@/lib/api/organizations';
import type { Board, Organization } from '@/lib/types';

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
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
      const [orgs, boards] = await Promise.all([listOrganizations(), listBoards()]);
      const groupedBoards = boards.reduce<Record<string, Board[]>>((acc, board) => {
        const orgId = String(board.organizationId ?? '');
        if (orgId) acc[orgId] = [...(acc[orgId] ?? []), board];
        return acc;
      }, {});
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
      const createdOrganization = await createOrganization(name, description);
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
      const createdBoard = await createBoard(name, selectedOrgId);
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Organizations</span>

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
            <div className="min-w-44 rounded-xl bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-700">{activeOrganization?.name ?? 'No organizations'}</div>
          )}
        </div>

        <button type="button" className="button-primary" onClick={() => setIsCreateOpen(true)}>
          + New Organization
        </button>
      </header>

      {isCreateOpen && (
        <div className="dashboard-form-card">
          <h3 className="mb-4 text-xl font-extrabold text-slate-900">Create new organization</h3>

          <form className="grid gap-4" onSubmit={handleCreateOrganization}>
            <div>
              <label className="dashboard-field-label" htmlFor="org-name">
                Organization name
              </label>
              <input
                id="org-name"
                className="form-input"
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
                className="form-input min-h-24 resize-y"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe your organization"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" className="button-secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="button-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="mx-auto mt-6 max-w-7xl">
        <div className="surface-card p-5 sm:p-6">
          <p className="text-sm text-slate-500">Selected organization</p>
          {isLoading ? (
            <p className="mt-2 text-slate-500">Loading organizations...</p>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{activeOrganization?.name ?? 'No organization selected'}</h2>
              <p className="mt-2 text-slate-600">
                {activeOrganization?.description || 'No description available.'}
              </p>
              <p className="mt-2 text-sm text-slate-500">Role: {activeOrganization?.role ?? 'Owner'}</p>

              {activeOrganization?.members && activeOrganization.members.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-slate-500">Members ({activeOrganization.members.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {[...activeOrganization.members]
                      .sort((a, b) => (a.role === 'admin' ? -1 : b.role === 'admin' ? 1 : 0))
                      .map((member) => (
                        <div key={member.id} className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">
                          <span className="assignee-avatar" title={member.email}>{getInitials(member.username)}</span>
                          <span className="text-sm font-medium text-slate-800">{member.username}</span>
                          <span className={member.role === 'admin' ? 'text-[11px] font-semibold text-indigo-600' : 'text-[11px] text-slate-500'}>
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6">
          <div className="dashboard-section-header">
            <h3 className="text-xl font-extrabold text-slate-900">Boards</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{(activeOrganization?.boards?.length ?? 0)} boards</span>
              <button type="button" className="button-primary" onClick={() => setIsBoardCreateOpen(true)}>
                + Create Board
              </button>
            </div>
          </div>

          {isBoardCreateOpen && (
            <div className="surface-card mb-5 p-5">
              <h3 className="mb-4 text-xl font-extrabold text-slate-900">Create new board</h3>

              <form className="grid gap-4" onSubmit={handleCreateBoard}>
                <div>
                  <label className="dashboard-field-label" htmlFor="board-name">
                    Board name
                  </label>
                  <input
                    id="board-name"
                    className="form-input"
                    value={boardFormData.name}
                    onChange={(event) => setBoardFormData({ name: event.target.value })}
                    placeholder="Sprint Planning"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" className="button-secondary" onClick={() => setIsBoardCreateOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBoardSubmitting}
                    className="button-primary"
                  >
                    {isBoardSubmitting ? 'Creating...' : 'Create Board'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
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
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-extrabold text-slate-900">{board.name}</h4>
                    <span className="board-badge">Board</span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{board.description}</p>
                </div>
              ))
            ) : (
              <div className="dashboard-empty">No boards available in this organization.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
