import prisma from "../prisma";

const client = new prisma.PrismaClient();

export const getAllCourses = async () => {
    return await client.course.findMany({
        include: {
            resources: true, // Include related resources
            purchases: true, // Include related purchases
        },
    });
};

export const getCourseById = async (id) => {
    return await client.course.findUnique({
        where: { id },
        include: {
            resources: true, // Include related resources
            purchases: true, // Include related purchases
        },
    });
};

export const createCourse = async (data) => {
    return await client.course.create({
        data,
    });
};

export const updateCourse = async (id, data) => {
    return await client.course.update({
        where: { id },
        data,
    });
};

export const deleteCourse = async (id) => {
    return await client.course.delete({
        where: { id },
    });
};
