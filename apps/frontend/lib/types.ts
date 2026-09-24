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
    members?: OrganizationMember[];
};

export type OrganizationMember = {
        id: string;
        username: string;
        email: string;
        role?: string;
};

export type IssueStatus = 'UPCOMING' | 'IN_PROGRESS' | 'DONE';

export type IssueTag =
    | 'DESIGN'
    | 'FRONTEND_CODING'
    | 'BACKEND_CODING'
    | 'MARKETING'
    | 'PRODUCT'
    | 'BUG'
    | 'DOCUMENTATION'
    | 'RESEARCH'
    | 'TESTING'
    | 'OPERATIONS'
    | 'FEATURE';

export type Issue = {
    id: string;
    name: string;
    description: string;
    status?: IssueStatus;
    tag: IssueTag;
    boardId: string;
};
