import prisma from "../prisma";

export const getAllUsers = async () => {
    return await prisma.user.findMany({
        include: {
            role: true, // Include related role
            purchased: {
                include: {
                    course: true, // Include course details in purchases
                    resource: true, // Include resource details in purchases
                },
            },
        },
    });
};

export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            role: true, // Include related role
            purchased: {
                include: {
                    course: true, // Include course details in purchases
                    resource: true, // Include resource details in purchases
                },
            },
        },
    });
};

export const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

export const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};

export const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id },
    });
};
