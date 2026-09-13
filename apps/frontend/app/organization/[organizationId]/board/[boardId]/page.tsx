'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { BOARD_API, ISSUE_API, ORG_API, WS_URL } from '@repo/config';
import { BoardHeader, type BoardOption } from '../../../../../components/board-header';
import { IssueCreateForm, type IssueFormData } from '../../../../../components/issue-create-form';
import { IssueCard } from '../../../../../components/issue-card';
import { ProfileMenu } from '../../../../../components/profile-menu';

type IssueStatus = 'UPCOMING' | 'IN_PROGRESS' | 'DONE';
type Issue = { id: string; name: string; description: string; status?: IssueStatus; boardId: string };
type Organization = { id: string; name: string; description?: string; adminId?: string };
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
    const [formData, setFormData] = useState<IssueFormData>({ name: '', description: '', status: 'UPCOMING' });
    const [ws, setWs] = useState<WebSocket | null>(null);

    const requestHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const loadContext = async () => {
            try {
                const [organizationsResponse, boardsResponse] = await Promise.all([
                    fetch(ORG_API.list, { headers: requestHeaders() }),
                    fetch(BOARD_API.list, { headers: requestHeaders() }),
                ]);
                const organizationsData = await organizationsResponse.json();
                const boardsData = await boardsResponse.json();
                const organizations = organizationsData.organizations ?? [];
                const availableBoards = boardsData.boards ?? [];
                setOrganization(organizations.find((item: Organization) => String(item.id) === organizationId));
                setBoards(availableBoards.map((board: BoardOption) => ({
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
                const response = await fetch(`${ISSUE_API.listByBoard}/${boardId}`, { headers: requestHeaders() });
                if (!response.ok) throw new Error('Failed to load issues');
                const data = await response.json();
                setIssues(Array.isArray(data.issues) ? data.issues : []);
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
        const wss = new WebSocket(WS_URL);
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
            const { type, issueId, status, name, description } = parsedData

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
                setIssues((prev) => ([...prev, { id: issueId , name, description, status,boardId}]))
            }

            console.log(data, "ISSUE", issues)
        }


    }, [])

    const moveIssue = (issueId: string, status: IssueStatus, direction: 'left' | 'right') => {
        const currentIndex = statusOrder.indexOf(status);
        const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
        const nextStatus = statusOrder[nextIndex];

        if (!nextStatus) return;

        ws?.send(JSON.stringify({
            type: 'issue_move',
            issueId,
            status,
            direction,
            boardId
        }))

    };


    const handleCreateIssue = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(ISSUE_API.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...requestHeaders() },
                body: JSON.stringify({ name: formData.name.trim(), description: formData.description.trim(), boardId, status: formData.status }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || 'Failed to create issue');
            const createdIssue: Issue = data.issue ?? {
                id: Date.now().toString(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: formData.status,
                boardId,
            };
            setIssues((current) => [createdIssue, ...current]);

            ws?.send(JSON.stringify({
                type: 'add_issue',
                createdIssue, issueId: createdIssue.id
            }))
            setFormData({ name: '', description: '', status: 'UPCOMING' });
            setIsIssueFormOpen(false);
        } catch (error) {
            console.error('Could not create issue:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddMember = async (email: string) => {
        throw new Error(`Adding ${email} requires a member API endpoint.`);
    };

    const tokenPayload = getTokenPayload();
    const currentUserId = tokenPayload.userId ?? tokenPayload.id ?? tokenPayload.sub;
    const isAdmin = Boolean(organization?.adminId && organization.adminId === currentUserId);
    const currentBoard = boards.find((board) => board.id === boardId);

    return (
        <main className="board-page">
            <BoardHeader organizationName={organization?.name ?? 'Organization'} boardName={currentBoard?.name ?? 'Board'} boardId={boardId} boards={boards} onProfileClick={() => setIsProfileOpen((open) => !open)} />
            {isProfileOpen && <div className="profile-menu-wrap"><ProfileMenu isAdmin={isAdmin} organizationName={organization?.name ?? 'Organization'} onAddMember={handleAddMember} /></div>}
            {isIssueFormOpen ? (
                <IssueCreateForm formData={formData} isSubmitting={isSubmitting} onChange={setFormData} onSubmit={handleCreateIssue} onCancel={() => setIsIssueFormOpen(false)} />
            ) : (
                <div className="issue-form-trigger-wrap"><button className="primary-button" type="button" onClick={() => setIsIssueFormOpen(true)}>+ Add issue</button></div>
            )}
            <section className="board-columns">
                {boardColumns.map((column) => (
                    <div key={column.key} className="board-column">
                        <div className="column-header"><div className="column-title-wrap"><span className="column-dot" style={{ background: column.accent }} /><h2>{column.title}</h2></div><span className="issue-count">{groupedIssues[column.key].length}</span></div>
                        <div className="issue-list">
                            {isLoading ? <div className="empty-state">Loading issues...</div> : groupedIssues[column.key].length > 0 ? groupedIssues[column.key].map((issue) => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    statusTitle={column.title}
                                    canMoveLeft={statusOrder.indexOf(column.key) > 0}
                                    canMoveRight={statusOrder.indexOf(column.key) < statusOrder.length - 1}
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
