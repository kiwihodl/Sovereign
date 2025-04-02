import prisma from '../prisma';

export const getAllDraftsByUserId = async userId => {
  return await prisma.draft.findMany({
    where: { userId },
    include: {
      user: true,
    },
  });
};

export const getDraftById = async id => {
  return await prisma.draft.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

export const createDraft = async data => {
  return await prisma.draft.create({
    data: {
      ...data,
      user: {
        connect: {
          id: data.user,
        },
      },
      additionalLinks: data.additionalLinks || [],
    },
  });
};

export const updateDraft = async (id, data) => {
  const { user, additionalLinks, ...otherData } = data;
  return await prisma.draft.update({
    where: { id },
    data: {
      ...otherData,
      user: user
        ? {
            connect: { id: user },
          }
        : undefined,
      additionalLinks: additionalLinks || undefined,
    },
  });
};

export const deleteDraft = async id => {
  return await prisma.draft.delete({
    where: { id },
  });
};
