import prisma from '../prisma';

export const getAllLessons = async () => {
  return await prisma.lesson.findMany({
    include: {
      course: true,
      resource: true,
      draft: true,
    },
  });
};

export const getLessonById = async id => {
  return await prisma.lesson.findUnique({
    where: { id },
    include: {
      course: true,
      resource: true,
      draft: true,
    },
  });
};

export const createLesson = async data => {
  return await prisma.lesson.create({
    data: {
      courseId: data.courseId,
      resourceId: data.resourceId,
      draftId: data.draftId,
      index: data.index,
    },
    include: {
      course: true,
      resource: true,
      draft: true,
    },
  });
};

export const updateLesson = async (id, data) => {
  return await prisma.lesson.update({
    where: { id },
    data: {
      courseId: data.courseId,
      resourceId: data.resourceId,
      draftId: data.draftId,
      index: data.index,
    },
    include: {
      course: true,
      resource: true,
      draft: true,
    },
  });
};

export const deleteLesson = async id => {
  return await prisma.lesson.delete({
    where: { id },
  });
};

export const getLessonsByCourseId = async courseId => {
  return await prisma.lesson.findMany({
    where: { courseId },
    include: {
      resource: true,
      draft: true,
    },
    orderBy: {
      index: 'asc',
    },
  });
};
