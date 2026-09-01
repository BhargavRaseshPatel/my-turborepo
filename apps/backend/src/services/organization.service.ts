import { prisma } from "db/client";

type CreateOrganizationInput = {
  name: string;
  description: string;
  adminId: string;
};

export const createOrganizationService = async ({
  name,
  description,
  adminId,
}: CreateOrganizationInput) => {
  return await prisma.organization.create({
    data: {
      name,
      description,
      adminId,
    },
  });
};