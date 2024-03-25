import prisma from "../prisma";

export const getAllCourses = async () => {
    return await prisma.course.findMany({
        include: {
            resources: true, // Include related resources
            purchases: true, // Include related purchases
        },
    });
};

export const getCourseById = async (id) => {
    return await prisma.course.findUnique({
        where: { id },
        include: {
            resources: true, // Include related resources
            purchases: true, // Include related purchases
        },
    });
};

export const createCourse = async (data) => {
    return await prisma.course.create({
        data,
    });
};

export const updateCourse = async (id, data) => {
    return await prisma.course.update({
        where: { id },
        data,
    });
};

export const deleteCourse = async (id) => {
    return await prisma.course.delete({
        where: { id },
    });
};
