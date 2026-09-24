export type Board = {
  id: string;
  name: string;
  description: string;
  organizationId?: string;
};

export type Organization = {
  id: string;
  name: string;
  description?: string;
  role?: string;
  adminId?: string;
  boards?: Board[];
};

export type IssueStatus = 'UPCOMING' | 'IN_PROGRESS' | 'DONE';

export type Issue = {
  id: string;
  name: string;
  description: string;
  status?: IssueStatus;
  boardId: string;
};
