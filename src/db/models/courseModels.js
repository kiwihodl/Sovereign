import prisma from "../prisma";

export const getAllCourses = async () => {
    return await prisma.course.findMany({
        include: {
            lessons: {
                include: {
                    resource: true,
                    draft: true
                },
                orderBy: {
                    index: 'asc'
                }
            },
            purchases: true,
        },
    });
};

export const getCourseById = async (id) => {
    return await prisma.course.findUnique({
        where: { id },
        include: {
            lessons: {
                include: {
                    resource: true,
                    draft: true
                },
                orderBy: {
                    index: 'asc'
                }
            },
            purchases: true,
        },
    });
};

export const createCourse = async (data) => {
    return await prisma.course.create({
        data: {
            id: data.id,
            noteId: data.noteId,
            user: { connect: { id: data.userId } },
            lessons: {
                create: data.lessons.map((lesson, index) => ({
                    resourceId: lesson.resourceId,
                    draftId: lesson.draftId,
                    index: index
                }))
            }
        },
        include: {
            lessons: {
                include: {
                    resource: true,
                    draft: true
                }
            },
            user: true
        }
    });
};

export const updateCourse = async (id, data) => {
    const { lessons, ...otherData } = data;
    return await prisma.course.update({
        where: { id },
        data: {
            ...otherData,
            lessons: {
                deleteMany: {},
                create: lessons.map((lesson, index) => ({
                    resourceId: lesson.resourceId,
                    draftId: lesson.draftId,
                    index: index
                }))
            }
        },
        include: {
            lessons: {
                include: {
                    resource: true,
                    draft: true
                },
                orderBy: {
                    index: 'asc'
                }
            }
        }
    });
};

export const deleteCourse = async (id) => {
    return await prisma.course.delete({
        where: { id },
    });
};