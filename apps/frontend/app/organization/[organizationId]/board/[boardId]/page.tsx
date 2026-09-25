'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { listBoards } from '../../../../../lib/api/boards';
import { createIssue, deleteIssue, listIssuesByBoard, updateIssueStatus } from '../../../../../lib/api/issues';
import { addOrganizationMember, listOrganizations } from '../../../../../lib/api/organizations';
import type { Issue, IssueStatus, Organization } from '../../../../../lib/types';
import { BoardHeader, type BoardOption } from '../../../../../components/board-header';
import { IssueCreateForm, type IssueFormData } from '../../../../../components/issue-create-form';
import { IssueCard } from '../../../../../components/issue-card';
import { ProfileMenu } from '../../../../../components/profile-menu';

type BoardDetailPageProps = { params: Promise<{ organizationId: string; boardId: string }> };

const boardColumns: Array<{ key: IssueStatus; title: string; accent: string }> = [
    { key: 'UPCOMING', title: 'Upcoming', accent: '#8b5cf6' },
    { key: 'IN_PROGRESS', title: 'In Progress', accent: '#f59e0b' },
    { key: 'DONE', title: 'Done', accent: '#10b981' },
];

const normalizeStatus = (status?: string): IssueStatus => {
    if (status === 'IN_PROGRESS') return 'IN_PROGRESS';
    if (status === 'DONE') return 'DONE';
    return 'UPCOMING';
};

const statusOrder: IssueStatus[] = ['UPCOMING', 'IN_PROGRESS', 'DONE'];

const getTokenPayload = (): Record<string, string> => {
    try {
        const token = localStorage.getItem('token');
        return token ? JSON.parse(atob(token.split('.')[1])) as Record<string, string> : {};
    } catch {
        return {};
    }
};

export default function OrganizationBoardPage({ params }: BoardDetailPageProps) {
    const { organizationId, boardId } = use(params);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [organization, setOrganization] = useState<Organization>();
    const [boards, setBoards] = useState<BoardOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [formData, setFormData] = useState<IssueFormData>({ name: '', description: '', status: 'UPCOMING', tag: 'FEATURE', memberIds: [] });
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [liveCount, setLiveCount] = useState(0);

    useEffect(() => {
        const loadContext = async () => {
            try {
                const [organizations, availableBoards] = await Promise.all([listOrganizations(), listBoards()]);
                setOrganization(organizations.find((item: Organization) => String(item.id) === organizationId));
                setBoards(availableBoards.map((board) => ({
                    id: String(board.id), name: board.name, organizationId: String(board.organizationId),
                })));
            } catch (error) {
                console.error('Could not load board context:', error);
            }
        };
        loadContext();
    }, [organizationId]);

    useEffect(() => {
        const loadIssues = async () => {
            setIsLoading(true);
            try {
                setIssues(await listIssuesByBoard(boardId));
            } catch (error) {
                console.error('Could not fetch issues:', error);
                setIssues([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadIssues();
    }, [boardId]);

    const groupedIssues = useMemo(() => {
        const result: Record<IssueStatus, Issue[]> = { UPCOMING: [], IN_PROGRESS: [], DONE: [] };
        issues.forEach((issue) => result[normalizeStatus(issue.status)].push(issue));
        return result;
    }, [issues]);

    useEffect(() => {
        const wss = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3006");
        setWs(wss);

        wss.onopen = () => {
            wss.send(JSON.stringify({
                type: "join",
                token: localStorage.getItem('token'),
                boardId
            }));
        };

        wss.onmessage = (ev: any) => {
            const data = ev.data;

            const parsedData = JSON.parse(data);
            const { type, issueId, status, tag, name, description } = parsedData

            if (type == 'presence') {
                setLiveCount(parsedData.count)
            }

            if (type == 'issue_move') {
                setIssues((prev) =>
                    prev.map((issue: Issue) =>
                        issue.id === issueId ? { ...issue, status } : issue))
            }

            //  ws?.send(JSON.stringify({
            //     type : 'add_issue',
            //     createdIssue
            // }))

            if (type == 'add_issue') {
                setIssues((prev) => prev.some((issue) => issue.id === issueId)
                    ? prev
                    : [...prev, { id: issueId, name, description, status, tag, boardId }])
            }

            console.log(data, "ISSUE", issues)
        }


    }, [])

const moveIssue = async (issueId: string, status: IssueStatus, direction: 'left' | 'right') => {
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    const nextStatus = statusOrder[nextIndex];

    if (!nextStatus) return;

    try {
        await updateIssueStatus(issueId, nextStatus);

        ws?.send(JSON.stringify({
            type: 'issue_move',
            issueId,
            status,
            direction,
            boardId
        }));
    } catch (error) {
        console.error('Could not move issue:', error);
    }
};


    const handleCreateIssue = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) return;
        setIsSubmitting(true);
        try {
            const createdIssue = await createIssue({
                name: formData.name.trim(),
                description: formData.description.trim(),
                boardId,
                status: formData.status,
                tag: formData.tag,
                memberIds: formData.memberIds,
            });
            setIssues((current) => current.some((issue) => issue.id === createdIssue.id)
                ? current
                : [createdIssue, ...current]);

            ws?.send(JSON.stringify({
                type: 'add_issue',
                createdIssue, issueId: createdIssue.id, boardId
            }))
            setFormData({ name: '', description: '', status: 'UPCOMING', tag: 'FEATURE', memberIds: [] });
            setIsIssueFormOpen(false);
        } catch (error) {
            console.error('Could not create issue:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteIssue = async (issueId: string) => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;

        try {
            await deleteIssue(issueId);
            setIssues((current) => current.filter((issue) => issue.id !== issueId));
        } catch (error) {
            console.error('Could not delete issue:', error);
        }
    };

    const handleAddMember = async (email: string) => {
        await addOrganizationMember(organizationId, email);
    };

    const tokenPayload = getTokenPayload();
    const currentUserId = tokenPayload.userId ?? tokenPayload.id ?? tokenPayload.sub;
    const isAdmin = Boolean(organization?.adminId && organization.adminId === currentUserId);
    const currentBoard = boards.find((board) => board.id === boardId);

    return (
        <main className="board-page">
            <BoardHeader organizationName={organization?.name ?? 'Organization'} boardName={currentBoard?.name ?? 'Board'} boardId={boardId} boards={boards} liveCount={liveCount} onProfileClick={() => setIsProfileOpen((open) => !open)} />
            {isProfileOpen && <div className="profile-overlay"><div className="pointer-events-auto"><ProfileMenu isAdmin={isAdmin} organizationName={organization?.name ?? 'Organization'} onAddMember={handleAddMember} /></div></div>}
            {isIssueFormOpen ? (
                <IssueCreateForm formData={formData} isSubmitting={isSubmitting} members={organization?.members ?? []} onChange={setFormData} onSubmit={handleCreateIssue} onCancel={() => setIsIssueFormOpen(false)} />
            ) : (
                <div className="floating-action"><button className="button-gradient shadow-xl shadow-indigo-600/25" type="button" onClick={() => setIsIssueFormOpen(true)}>+ Add issue</button></div>
            )}
            <section className="board-grid">
                {boardColumns.map((column) => (
                    <div key={column.key} className="board-column">
                        <div className="column-header"><div className="column-heading"><span className="column-dot" style={{ background: column.accent }} /><h2 className="column-title">{column.title}</h2></div><span className="column-issue-count">{groupedIssues[column.key].length}</span></div>
                        <div className="issue-list">
                            {isLoading ? <div className="empty-state">Loading issues...</div> : groupedIssues[column.key].length > 0 ? groupedIssues[column.key].map((issue) => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    canMoveLeft={statusOrder.indexOf(column.key) > 0}
                                    canMoveRight={statusOrder.indexOf(column.key) < statusOrder.length - 1}
                                    onDelete={() => handleDeleteIssue(issue.id)}
                                    onMove={(direction) => moveIssue(issue.id, column.key, direction)}
                                />
                            )) : <div className="empty-state">No issues here</div>}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
