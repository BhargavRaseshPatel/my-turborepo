// auth.service.ts

import { prisma } from "db/client";
import bcrypt from "bcrypt";

export const loginUser = async (
    email: string,
    password: string
) => {
    const user = await prisma.user.findFirst({
        where: { email }
    });

    if (!user) {
        return null;
    }

    const passwordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordValid) {
        return null;
    }

    return user;
};

type CreateUserInput = {
    email: string;
    password: string;
    username: string;
};

export const createUserService = async ({
    email,
    password,
    username,
}: CreateUserInput) => {

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: {
            email,
            password : passwordHash,
            username,
        },
    });

    return user;
};