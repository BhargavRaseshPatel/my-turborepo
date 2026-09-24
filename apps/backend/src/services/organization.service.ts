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
    const organizations = await prisma.organization.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        select: {
            id: true,
            name: true,
            description: true,
            adminId: true,
            members: {
                select: {
                    role: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    return organizations.map((organization) => ({
        ...organization,
        role: organization.members.find((member) => member.userId === userId)?.role ?? "member",
    }));
};

type AddOrganizationMemberInput = {
    organizationId: string;
    adminId: string;
    email: string;
};

export const addOrganizationMemberService = async ({
    organizationId,
    adminId,
    email,
}: AddOrganizationMemberInput) => {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
    });

    if (!organization) {
        throw new Error("Organization not found");
    }

    if (organization.adminId !== adminId) {
        throw new Error("Only organization admins can add members");
    }

    const user = await prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const existingMembership = await prisma.members.findUnique({
        where: {
            userId_orgId: {
                userId: user.id,
                orgId: organizationId,
            },
        },
    });

    if (existingMembership) {
        throw new Error("User is already a member of this organization");
    }

    return prisma.members.create({
        data: {
            userId: user.id,
            orgId: organizationId,
            role: "member",
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
};