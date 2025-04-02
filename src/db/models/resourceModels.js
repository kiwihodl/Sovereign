import prisma from '../prisma';

export const getAllResources = async () => {
  return await prisma.resource.findMany({
    include: {
      course: true, // Include related course
      purchases: true, // Include related purchases
    },
  });
};

export const getResourceById = async id => {
  return await prisma.resource.findUnique({
    where: { id },
    include: {
      user: true,
      lessons: {
        include: {
          course: true,
        },
      },
      purchases: true,
      draftLessons: true,
    },
  });
};

export async function isResourcePartOfAnyCourse(resourceId) {
  const courses = await prisma.course.findMany({
    where: {
      resources: {
        some: {
          id: resourceId,
        },
      },
    },
  });
  return courses.length > 0;
}

export const updateLessonInCourse = async (courseId, resourceId, data) => {
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      resources: {
        update: {
          where: { id: resourceId },
          data: {
            title: data.title,
            summary: data.summary,
            // Add any other fields you want to update in the lesson
          },
        },
      },
    },
  });
};

export const createResource = async data => {
  return await prisma.resource.create({
    data,
  });
};

export const updateResource = async (id, data) => {
  return await prisma.resource.update({
    where: { id },
    data,
    include: {
      user: true,
      lessons: {
        include: {
          course: true,
        },
      },
      purchases: true,
      draftLessons: true,
    },
  });
};

export const deleteResource = async id => {
  return await prisma.resource.delete({
    where: { id },
  });
};
