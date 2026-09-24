import { prisma } from "db/client";
import { IssueStatus } from "../../../../packages/db/generated/prisma/enums";


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