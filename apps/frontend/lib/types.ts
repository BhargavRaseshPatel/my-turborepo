import type { IssueTag  as IssueTagDB} from "../../../packages/db/generated/prisma/enums"

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

export type IssueTag = IssueTagDB

export type Issue = {
    id: string;
    name: string;
    description: string;
    status?: IssueStatus;
    tag: IssueTag;
    boardId: string;
};
