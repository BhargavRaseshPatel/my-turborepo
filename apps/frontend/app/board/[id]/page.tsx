'use client';

import { use } from 'react';

const boardColumns = [
  {
    key: 'upcoming',
    title: 'Upcoming',
    accent: '#6366f1',
    items: [
      { title: 'Design landing page hero section', tag: 'Design', meta: '3 tasks', assignees: ['AL', 'KM', 'RS'] },
      { title: 'Refine pricing cards', tag: 'Marketing', meta: '2 tasks', assignees: ['JN'] },
    ],
  },
  {
    key: 'inprogress',
    title: 'In Progress',
    accent: '#f59e0b',
    items: [
      { title: 'Build board drag interactions', tag: 'Frontend', meta: '5 tasks', assignees: ['MP', 'SH', 'AR'] },
      { title: 'Fix dashboard filters', tag: 'Bug', meta: '2 tasks', assignees: ['TN'] },
    ],
  },
  {
    key: 'done',
    title: 'Done',
    accent: '#10b981',
    items: [
      { title: 'Finalize onboarding flow', tag: 'Product', meta: 'Completed', assignees: ['LB', 'KJ'] },
      { title: 'Prepare sprint summary', tag: 'Ops', meta: 'Completed', assignees: ['MS'] },
    ],
  },
];

type BoardPageProps = { params: Promise<{ id: string }> };

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);

  return (
    <main className="board-page">
      <header className="board-header">
        <div>
          <p className="board-eyebrow">Project workspace</p>
          <h1 className="board-heading">Website Redesign</h1>
          <p className="mt-2 text-sm text-slate-600">Board ID: {id}</p>
        </div>
        <div className="board-actions">
          <button className="demo-board-button" type="button">Board view</button>
          <div className="demo-profile" aria-label="User profile">
            <div className="avatar">BP</div>
            <div className="board-profile">
              <strong className="text-sm text-slate-900">Bhargav</strong>
              <span className="text-[11px] text-slate-500">Product Lead</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-start gap-5 lg:grid-cols-3">
        {boardColumns.map((column) => (
          <div key={column.key} className="board-column">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5"><span className="size-3 rounded-full" style={{ background: column.accent }} /><h2 className="text-lg font-extrabold text-slate-900">{column.title}</h2></div>
              <span className="column-count">{column.items.length}</span>
            </div>
            <div className="flex flex-col gap-3.5">
              {column.items.map((item, index) => (
                <article key={`${column.key}-${index}`} className="demo-issue-card">
                  <div className="demo-card-meta"><span className="status-pill px-2.5 py-1.5">{item.tag}</span><span className="text-[11px] font-semibold text-slate-500">{item.meta}</span></div>
                  <h3 className="demo-card-title">{item.title}</h3>
                  <div className="demo-card-footer">
                    <div className="assignee-stack">
                      {item.assignees.map((person) => <span key={person} className="assignee-avatar">{person}</span>)}
                    </div>
                    <button className="demo-view-button" type="button">View</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
