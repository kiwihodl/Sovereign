import prisma from "@/db/prisma";

// Get all CourseDrafts for a specific user
export const getAllCourseDraftsByUserId = async (userId) => {
    return await prisma.courseDraft.findMany({
        where: { userId },
        include: {
            user: true, // Include the related user
            draftLessons: {
                include: {
                    draft: true,
                    resource: true
                },
                orderBy: {
                    index: 'asc'
                }
            },
        },
    });
};

// Get a specific CourseDraft by its ID
export const getCourseDraftById = async (id) => {
    return await prisma.courseDraft.findUnique({
        where: { id },
        include: {
            user: true, // Include the related user
            draftLessons: {
                include: {
                    draft: true,
                    resource: true
                },
                orderBy: {
                    index: 'asc'
                }
            },
        },
    });
};

// Create a new CourseDraft
export const createCourseDraft = async (data) => {
    return await prisma.courseDraft.create({
        data: {
            ...data,
            user: { connect: { id: data.userId } },
        },
        include: {
            draftLessons: {
                include: {
                    draft: true,
                    resource: true
                },
                orderBy: {
                    index: 'asc'
                }
            },
        }
    });
};

// Update an existing CourseDraft by its ID
export const updateCourseDraft = async (id, data) => {
    const { draftLessons, ...otherData } = data;
    return await prisma.courseDraft.update({
        where: { id },
        data: {
            ...otherData,
            draftLessons: {
                deleteMany: {},
                create: draftLessons.map((lesson, index) => ({
                    draftId: lesson.draftId,
                    resourceId: lesson.resourceId,
                    index: index
                }))
            }
        },
        include: {
            draftLessons: {
                include: {
                    draft: true,
                    resource: true
                },
                orderBy: {
                    index: 'asc'
                }
            }
        }
    });
};

// Delete a CourseDraft by its ID
export const deleteCourseDraft = async (id) => {
    return await prisma.$transaction(async (prisma) => {
        // First, delete all associated DraftLessons
        await prisma.draftLesson.deleteMany({
            where: { courseDraftId: id },
        });

        // Then, delete the CourseDraft
        return await prisma.courseDraft.delete({
            where: { id },
        });
    });
};