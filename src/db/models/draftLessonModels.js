import prisma from '../prisma';

export const getAllDraftLessons = async () => {
  return await prisma.draftLesson.findMany({
    include: {
      courseDraft: true,
      draft: true,
      resource: true,
    },
  });
};

export const getDraftLessonById = async id => {
  return await prisma.draftLesson.findUnique({
    where: { id },
    include: {
      courseDraft: true,
      draft: true,
      resource: true,
    },
  });
};

export const createDraftLesson = async data => {
  return await prisma.draftLesson.create({
    data: {
      courseDraftId: data.courseDraftId,
      draftId: data.draftId,
      resourceId: data.resourceId,
      index: data.index,
    },
    include: {
      courseDraft: true,
      draft: true,
      resource: true,
    },
  });
};

export const updateDraftLesson = async (id, data) => {
  return await prisma.draftLesson.update({
    where: { id },
    data: {
      courseDraftId: data.courseDraftId,
      draftId: data.draftId,
      resourceId: data.resourceId,
      index: data.index,
    },
    include: {
      courseDraft: true,
      draft: true,
      resource: true,
    },
  });
};

export const deleteDraftLesson = async id => {
  return await prisma.draftLesson.delete({
    where: { id },
  });
};

export const getDraftLessonsByCourseDraftId = async courseDraftId => {
  return await prisma.draftLesson.findMany({
    where: { courseDraftId },
    include: {
      draft: true,
      resource: true,
    },
    orderBy: {
      index: 'asc',
    },
  });
};
