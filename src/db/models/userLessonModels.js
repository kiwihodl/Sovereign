import prisma from '@/db/prisma';

export const getUserLessons = async userId => {
  return await prisma.userLesson.findMany({
    where: { userId },
    include: { lesson: true },
  });
};

export const getUserLesson = async (userId, lessonId) => {
  return await prisma.userLesson.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    include: { lesson: true },
  });
};

export const createOrUpdateUserLesson = async (userId, lessonId, data) => {
  return await prisma.userLesson.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      ...data,
    },
  });
};

export const deleteUserLesson = async (userId, lessonId) => {
  return await prisma.userLesson.delete({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });
};
