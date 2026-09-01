import { prisma } from "db/client";

type CreateIssueInput = {
  name: string;
  description: string;
  boardId: string;
};

export const createIssueService = async ({
  name,
  description,
  boardId,
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
      status: "UPCOMING",
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
