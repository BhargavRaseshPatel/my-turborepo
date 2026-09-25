# Trello Project — Monorepo

A Trello-style project management app: organizations → boards → issues, with real-time
collaboration. Built as a [Turborepo](https://turborepo.dev/) with three runnable apps
(frontend, backend, websocket) sharing a Prisma database and config package.

---

## Architecture at a glance

```
                          ┌──────────────────────────┐
                          │  Frontend (Next.js 16)    │
                          │  localhost:3000           │
                          └───────────┬──────────────┘
                        REST (fetch)  │   │  WebSocket
                     + JWT in header  │   │  (join/presence/issue events)
                          ┌───────────▼┐  └──▼───────────────────┐
                          │ Backend    │     │ WebSocket server   │
                          │ Express 5  │     │ ws, localhost:3006 │
                          │ :4000      │     └──▲─────────────────┘
                          └─────┬──────┘        │ verifies same JWT
                                │ Prisma        │
                          ┌─────▼───────────────┴──┐
                          │ PostgreSQL (via Prisma) │
                          └─────────────────────────┘
```

- **Frontend** renders the UI and calls the backend over REST. For a board it also opens a
  WebSocket connection to receive live updates (issue moves, new issues, live viewer count).
- **Backend** is the source of truth: auth, organizations, boards, issues — all persisted
  through Prisma.
- **WebSocket server** holds only in-memory room state (who is connected to which board) and
  fans out events. It does not touch the database.
- **Auth** is a JWT issued by the backend on sign-in; the frontend stores it in
  `localStorage` and sends it to both the backend (REST) and the websocket (in the `join`
  message).

---

## Repository layout

```
my-turborepo/
├── apps/
│   ├── frontend/     Next.js 16 (App Router) + Tailwind CSS v4  → :3000
│   ├── backend/      Express 5 REST API (tsx)                   → :4000
│   └── websocket/    ws server for real-time board events       → :3006
├── packages/
│   ├── db/           Prisma schema + generated client (shared)
│   ├── config/       Shared API base URL + endpoint constants
│   ├── ui/           Shared React component stubs
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json        Turborepo task pipeline
└── package.json      npm workspaces + root scripts
```

---

## The database (`packages/db`)

PostgreSQL via **Prisma 7** (`@prisma/client` + `@prisma/adapter-pg`). The client is
exported from `db/client` and imported by the backend as `import { prisma } from "db/client"`.

**Models** (`packages/db/prisma/schema.prisma`):

| Model          | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `User`         | Account: `username`, `email`, `password` (bcrypt-hashed).               |
| `Organization` | A workspace. Has one admin (`adminId` → User) and many members/boards.  |
| `Members`      | Join table `User ↔ Organization` with a `role` (`admin` / `member`). Unique per `(userId, orgId)`. |
| `Board`        | Belongs to an Organization, holds Issues.                               |
| `Issue`        | Task on a board. Has `status` (UPCOMING/IN_PROGRESS/DONE) and `tag`.    |
| `IssueMapping` | Join table `User ↔ Issue` — the members assigned to an issue. Unique per `(userId, issueId)`. |
| `Comments`     | Comments on an issue.                                                   |

Key relationships: an Organization has many Members and Boards; a Board has many Issues; an
Issue has many assigned members (through `IssueMapping`) and many Comments.

**Enums:** `IssueStatus` (UPCOMING, IN_PROGRESS, DONE) and `IssueTag` (DESIGN,
FRONTEND_CODING, BACKEND_CODING, MARKETING, PRODUCT, BUG, DOCUMENTATION, RESEARCH, TESTING,
OPERATIONS, FEATURE).

---

## Backend (`apps/backend`)

Express 5 running under `tsx`. Layered as **routes → controllers → services**, with services
being the only layer that talks to Prisma. Auth uses `jsonwebtoken`; passwords use `bcrypt`.
Protected routes go through `authMiddleware`, which reads the JWT and attaches the user id.

Base URL: `http://localhost:4000`, all routes under `/api`.

| Method | Route                                     | Auth | Description                                  |
| ------ | ----------------------------------------- | ---- | -------------------------------------------- |
| POST   | `/api/auth/signup`                        | —    | Create a user, return a JWT.                 |
| POST   | `/api/auth/signin`                        | —    | Sign in, return a JWT.                       |
| GET    | `/api/auth/me`                            | ✓    | Current user from the token.                 |
| GET    | `/api/organizations`                      | ✓    | Orgs the user belongs to, with members.      |
| POST   | `/api/organizations/createOrg`            | ✓    | Create an org (creator becomes admin).       |
| POST   | `/api/organizations/:organizationId/members` | ✓ | Add a member by email (admin only).          |
| GET    | `/api/boards`                             | ✓    | Boards for the user's orgs.                  |
| POST   | `/api/boards`                             | ✓    | Create a board.                              |
| GET    | `/api/issues/board/:boardId`              | ✓    | Issues on a board, incl. assigned members.   |
| POST   | `/api/issues`                             | ✓    | Create an issue (accepts `memberIds[]`).     |
| PUT    | `/api/issues/updateIssue/:issueID`        | ✓    | Update issue status.                         |
| DELETE | `/api/issues/:issueID`                    | ✓    | Delete an issue (and its mappings/comments). |
| GET    | `/api/health`                             | —    | Health check.                               |

Structure: `src/server.ts` (boots the app) → `src/app.ts` (middleware + route mounting) →
`src/routes/*` → `src/controllers/*` → `src/services/*`. Utilities: `src/utils/jwt.ts`,
`src/utils/middleware.ts`.

---

## WebSocket server (`apps/websocket`)

A standalone `ws` server on **port 3006** for real-time board collaboration. State is kept in
memory only (`USERS[boardId] = [{ userId, socket }]`) — nothing is persisted. Each client
authenticates by sending its JWT in the `join` message, which is verified by `authMiddleware`.

**Messages the client sends:**

- `join` — `{ type, token, boardId }`: joins the board's room.
- `add_issue` — broadcasts a newly created issue to everyone on the board.
- `issue_move` — broadcasts an issue moving between columns.

**Messages the server pushes:**

- `initial_state` — the users already in the room when you join.
- `join` / `leave` — a user joined or left.
- `presence` — `{ type, boardId, count }`: the live count of distinct viewers (drives the
  "N live" badge on the board header).
- `add_issue` / `issue_move` — relayed board changes so all viewers stay in sync.

---

## Frontend (`apps/frontend`)

**Next.js 16** (App Router, React 19) styled with **Tailwind CSS v4**. Shared component
classes live in `app/globals.css`; API endpoint constants come from the `@repo/config`
package so URLs aren't hardcoded.

**Routes (`app/`):**

- `/auth-screen` — sign in / sign up.
- `/dashboard` — pick an organization, see its members (admin/member with initials avatars),
  add members by email (admins), create boards.
- `/organization/[organizationId]/board/[boardId]` — the board: columns (Upcoming / In
  Progress / Done), create/move/delete issues, assign members, live viewer count. Redirects
  to `/dashboard` if the user isn't a member of the org.
- `/board/[id]` — a static demo board.

**Data layer (`lib/api/`):** `client.ts` wraps `fetch` and attaches the JWT; `auth.ts`,
`organizations.ts`, `boards.ts`, `issues.ts` are typed wrappers per resource. Types live in
`lib/types.ts`.

---

## Getting started

### Prerequisites

- **Node.js ≥ 24** and **npm 10** (see `package.json` → `engines` / `packageManager`).
- A **PostgreSQL** database (local or hosted).

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create `packages/db/.env` with your database connection:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/trello"
```

The backend also loads this file (see its `dev` script). Set a JWT secret where the backend
expects it (`apps/backend/.env`), and optionally point the frontend at non-default URLs:

```bash
# apps/frontend/.env.local  (optional — these are the defaults)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:3006
```

### 3. Set up the database

```bash
cd packages/db
npx prisma migrate dev      # create tables
npx prisma generate         # generate the client
cd ../..
```

### 4. Run everything

```bash
npm run dev          # all apps via Turborepo
```

Or run apps individually:

```bash
npm run dev --workspace=frontend    # :3000
npm run dev --workspace=backend     # :4000
npm run dev --workspace=websocket   # :3006
```

Then open **http://localhost:3000**.

---

## Handy scripts (root)

| Command                | What it does                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Run all apps in watch mode (Turbo).   |
| `npm run build`        | Build all apps/packages.              |
| `npm run lint`         | Lint everything.                      |
| `npm run check-types`  | Type-check everything.                |
| `npm run format`       | Prettier across the repo.             |

---

## Ports

| App        | Port | URL                     |
| ---------- | ---- | ----------------------- |
| Frontend   | 3000 | http://localhost:3000   |
| Backend    | 4000 | http://localhost:4000   |
| WebSocket  | 3006 | ws://localhost:3006     |
