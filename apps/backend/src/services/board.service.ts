import { prisma } from "db/client";

export const getBoardsService = async (userId: string) => {
  const memberships = await prisma.members.findMany({
    where: {
      userId,
    },
    select: {
      orgId: true,
    },
  });

  const boards = await prisma.board.findMany({
    where: {
      organizationId: {
        in: memberships.map((member) => member.orgId),
      },
    },
  });

  return boards;
};

type CreateBoardInput = {
  name: string;
  organizationId: string;
  userId: string;
};

export const createBoardService = async ({
  name,
  organizationId,
  userId,
}: CreateBoardInput) => {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      adminId: userId,
    },
  });

  if (!organization) {
    throw new Error("Only the organization admin can create a board");
  }

  return prisma.board.create({
    data: {
      name,
      organizationId,
    },
  });
};
