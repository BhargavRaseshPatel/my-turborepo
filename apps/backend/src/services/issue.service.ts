import { prisma } from "db/client";
import { IssueStatus, IssueTag } from "../../../../packages/db/generated/prisma/enums";


type CreateIssueInput = {
  name: string;
  description: string;
  boardId: string;
  status?: string;
  tag?: string;
  memberIds?: string[];
};

const normalizeIssueStatus = (status?: string): IssueStatus => {
  const normalizedStatus = status?.trim().toUpperCase();

  if (normalizedStatus === "IN_PROGRESS" || normalizedStatus === "DONE" || normalizedStatus === "UPCOMING") {
    return normalizedStatus as IssueStatus;
  }

  return "UPCOMING";
};

const normalizeIssueTag = (tag?: string): IssueTag => {
  const normalizedTag = tag?.trim().toUpperCase();
  const validTags = Object.values(IssueTag) as string[];

  if (normalizedTag && validTags.includes(normalizedTag)) {
    return normalizedTag as IssueTag;
  }

  return IssueTag.FEATURE;
};

export const createIssueService = async ({
  name,
  description,
  boardId,
  status,
  tag,
  memberIds,
}: CreateIssueInput) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const uniqueMemberIds = [...new Set(memberIds ?? [])];

  return prisma.issue.create({
    data: {
      name,
      description,
      boardId,
      status: normalizeIssueStatus(status),
      tag: normalizeIssueTag(tag),
      issueMappings: uniqueMemberIds.length
        ? { create: uniqueMemberIds.map((userId) => ({ userId })) }
        : undefined,
    },
    include: {
      issueMappings: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });
};

export const getIssuesService = async (boardId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return prisma.issue.findMany({
    where: {
      boardId,
    },
    include: {
      issueMappings: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });
};


export const updateIssueStatus = async (
  issueId: string,
  status: IssueStatus
) => {
  const issue = await prisma.issue.update({
    where: {
      id: issueId,
    },
    data: {
      status,
    },
  });

  return issue;
};

export const deleteIssueService = async (issueId: string) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  await prisma.$transaction([
    prisma.issueMapping.deleteMany({
      where: {
        issueId,
      },
    }),
    prisma.comments.deleteMany({
      where: {
        issueId,
      },
    }),
    prisma.issue.delete({
      where: {
        id: issueId,
      },
    }),
  ]);

  return issue;
};