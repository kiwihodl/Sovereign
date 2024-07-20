import prisma from "../prisma";

export const getAllContentIds = async () => {
    const courseIds = await prisma.course.findMany({
      select: {
        id: true,
      },
    });
  
    const resourceIds = await prisma.resource.findMany({
      select: {
        id: true,
      },
    });
  
    const combinedIds = [...courseIds, ...resourceIds].map((item) => item.id);
  
    return combinedIds;
  };