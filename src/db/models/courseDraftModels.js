import prisma from "@/db/prisma";

// Get all CourseDrafts for a specific user
export const getAllCourseDraftsByUserId = async (userId) => {
    return await prisma.courseDraft.findMany({
        where: { userId },
        include: {
            user: true, // Include the related user
            resources: true, // Include related resources
        },
    });
};

// Get a specific CourseDraft by its ID
export const getCourseDraftById = async (id) => {
    return await prisma.courseDraft.findUnique({
        where: { id },
        include: {
            user: true, // Include the related user
            resources: true, // Include related resources
        },
    });
};

// Create a new CourseDraft
export const createCourseDraft = async (data) => {
    return await prisma.courseDraft.create({
        data: {
            ...data,
            resources: {
                connect: data.resources.map((resource) => ({ id: resource.id })),
            },
        },
        include: {
            resources: true,
        }
    });
};

// Update an existing CourseDraft by its ID
export const updateCourseDraft = async (id, data) => {
    const { resourceIds, ...otherData } = data;
    return await prisma.courseDraft.update({
        where: { id },
        data: {
            ...otherData,
            resources: {
                set: resourceIds?.map((resourceId) => ({ id: resourceId })),
            },
        },
        include: { resources: true }
    });
};

// Delete a CourseDraft by its ID
export const deleteCourseDraft = async (id) => {
    return await prisma.courseDraft.delete({
        where: { id },
    });
};