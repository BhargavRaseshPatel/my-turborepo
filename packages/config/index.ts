export const API_PORT = 4000;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:${API_PORT}`;

export const AUTH_API = {
  signin: `${API_BASE_URL}/api/auth/signin`,
  signup: `${API_BASE_URL}/api/auth/signup`,
} as const;

export const ORG_API = {
  list: `${API_BASE_URL}/api/organizations`,
  create: `${API_BASE_URL}/api/organizations/createOrg`,
  addMember: (organizationId: string) => `${API_BASE_URL}/api/organizations/${organizationId}/members`,
} as const;

export const BOARD_API = {
  list: `${API_BASE_URL}/api/boards`,
  create: `${API_BASE_URL}/api/boards`,
} as const;

export const ISSUE_API = {
  base: `${API_BASE_URL}/api/issues`,
  create: `${API_BASE_URL}/api/issues`,
  listByBoard: `${API_BASE_URL}/api/issues/board`,
} as const;