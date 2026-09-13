import { prisma } from "db/client";

type IssueStatus = "UPCOMING" | "IN_PROGRESS" | "DONE";

type CreateIssueInput = {
  name: string;
  description: string;
  boardId: string;
  status?: string;
};

const normalizeIssueStatus = (status?: string): IssueStatus => {
  const normalizedStatus = status?.trim().toUpperCase();

  if (normalizedStatus === "IN_PROGRESS" || normalizedStatus === "DONE" || normalizedStatus === "UPCOMING") {
    return normalizedStatus as IssueStatus;
  }

  return "UPCOMING";
};

export const createIssueService = async ({
  name,
  description,
  boardId,
  status,
}: CreateIssueInput) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return prisma.issue.create({
    data: {
      name,
      description,
      boardId,
      status: normalizeIssueStatus(status),
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
  });
};

export const updateIssueStatusService = async (issueId: string, status: IssueStatus) => {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  return prisma.issue.update({
    where: {
      id: issueId,
    },
    data: {
      status,
    },
  });
};
