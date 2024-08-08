import prisma from "../prisma";

export const getAllResources = async () => {
    return await prisma.resource.findMany({
        include: {
            course: true, // Include related course
            purchases: true, // Include related purchases
        },
    });
};

export const getResourceById = async (id) => {
    return await prisma.resource.findUnique({
        where: { id },
        include: {
            course: true, // Include related course
            purchases: true, // Include related purchases
        },
    });
};

export async function isResourcePartOfAnyCourse(resourceId) {
    const courses = await prisma.course.findMany({
        where: {
            resources: {
                some: {
                    id: resourceId
                }
            }
        }
    });
    return courses.length > 0;
}

export const createResource = async (data) => {
    return await prisma.resource.create({
        data,
    });
};

export const updateResource = async (id, data) => {
    return await prisma.resource.update({
        where: { id },
        data,
    });
};

export const deleteResource = async (id) => {
    return await prisma.resource.delete({
        where: { id },
    });
};
