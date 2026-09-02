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

    const org = await prisma.organization.create({
        data: {
            name,
            description,
            adminId,
        },
    });

    const member = await prisma.members.create({
        data: {
            orgId: org.id,
            userId: adminId,
            role: 'admin'
        }
    })

    return org
};

export const getOrganizationsService = async (userId: string) => {
    const memberships = await prisma.members.findMany({
        where: {
            userId,
        },
        select: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    adminId: true,
                },
            },
        },
    });

    return memberships.map((membership) => membership.organization);
};