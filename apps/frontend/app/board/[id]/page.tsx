'use client';

import { use } from 'react';

const boardColumns = [
  {
    key: 'upcoming',
    title: 'Upcoming',
    accent: '#8b5cf6',
    items: [
      {
        title: 'Design landing page hero section',
        tag: 'Design',
        meta: '3 tasks',
        assignees: ['AL', 'KM', 'RS'],
      },
      {
        title: 'Refine pricing cards',
        tag: 'Marketing',
        meta: '2 tasks',
        assignees: ['JN'],
      },
    ],
  },
  {
    key: 'inprogress',
    title: 'In Progress',
    accent: '#f59e0b',
    items: [
      {
        title: 'Build board drag interactions',
        tag: 'Frontend',
        meta: '5 tasks',
        assignees: ['MP', 'SH', 'AR'],
      },
      {
        title: 'Fix dashboard filters',
        tag: 'Bug',
        meta: '2 tasks',
        assignees: ['TN'],
      },
    ],
  },
  {
    key: 'done',
    title: 'Done',
    accent: '#10b981',
    items: [
      {
        title: 'Finalize onboarding flow',
        tag: 'Product',
        meta: 'Completed',
        assignees: ['LB', 'KJ'],
      },
      {
        title: 'Prepare sprint summary',
        tag: 'Ops',
        meta: 'Completed',
        assignees: ['MS'],
      },
    ],
  },
];

type BoardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);

  return (
    <main className="board-page">
      <header className="board-header">
        <div>
          <p className="eyebrow">Project workspace</p>
          <h1>Website Redesign</h1>
          <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '14px' }}>Board ID: {id}</p>
        </div>

        <div className="header-actions">
          <button className="ghost-button">Board view</button>
          <div className="profile-pill" aria-label="User profile">
            <div className="profile-avatar">BP</div>
            <div className="profile-text">
              <strong>Bhargav</strong>
              <span>Product Lead</span>
            </div>
          </div>
        </div>
      </header>

      <section className="board-columns">
        {boardColumns.map((column) => (
          <div key={column.key} className="board-column">
            <div className="column-header">
              <div className="column-title-wrap">
                <span
                  className="column-dot"
                  style={{ background: column.accent }}
                />
                <h2>{column.title}</h2>
              </div>
              <span className="issue-count">{column.items.length}</span>
            </div>

            <div className="issue-list">
              {column.items.map((item, index) => (
                <article key={`${column.key}-${index}`} className="issue-card">
                  <div className="issue-top-row">
                    <span className="issue-tag">{item.tag}</span>
                    <span className="issue-meta">{item.meta}</span>
                  </div>

                  <h3>{item.title}</h3>

                  <div className="issue-footer">
                    <div className="assignee-stack">
                      {item.assignees.map((person) => (
                        <span key={person} className="assignee-badge">
                          {person}
                        </span>
                      ))}
                    </div>

                    <button className="mini-button">View</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f3f4f6;
          color: #111827;
        }

        * {
          box-sizing: border-box;
        }

        .board-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #eef2ff 0%, #f9fafb 100%);
          padding: 32px 24px 40px;
        }

        .board-header {
          max-width: 1280px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 6px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366f1;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .ghost-button {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.5);
          color: #374151;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .profile-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.5);
          border-radius: 20px;
          padding: 8px 16px 8px 8px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }

        .profile-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .profile-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .profile-text strong {
          font-size: 0.95rem;
        }

        .profile-text span {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .board-columns {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(280px, 1fr));
          gap: 22px;
          align-items: start;
        }

        .board-column {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 22px;
          padding: 18px 16px 14px;
          box-shadow: 0 20px 35px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(10px);
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 10px;
        }

        .column-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .column-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }

        .column-header h2 {
          margin: 0;
          font-size: 1.15rem;
        }

        .issue-count {
          min-width: 28px;
          height: 28px;
          border-radius: 10px;
          background: #eef2ff;
          color: #4338ca;
          display: grid;
          place-items: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .issue-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .issue-card {
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 16px 14px;
          box-shadow: 0 10px 18px rgba(15, 23, 42, 0.04);
        }

        .issue-top-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }

        .issue-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f5f3ff;
          color: #6d28d9;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .issue-meta {
          font-size: 0.72rem;
          color: #6b7280;
          font-weight: 600;
        }

        .issue-card h3 {
          margin: 0 0 16px;
          font-size: 1rem;
          line-height: 1.4;
          color: #111827;
        }

        .issue-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .assignee-stack {
          display: flex;
          align-items: center;
          padding-left: 6px;
        }

        .assignee-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          margin-left: -6px;
          background: linear-gradient(135deg, #dbeafe, #c7d2fe);
          border: 2px solid #fff;
          color: #1f2937;
          font-size: 0.62rem;
          font-weight: 800;
        }

        .assignee-badge:first-child {
          margin-left: 0;
        }

        .mini-button {
          border: none;
          background: #111827;
          color: #fff;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 980px) {
          .board-columns {
            grid-template-columns: 1fr;
          }

          .board-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </main>
  );
}
