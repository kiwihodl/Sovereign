import prisma from "../prisma";

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: {
      role: true,
      purchased: {
        include: {
          course: true,
          resource: true,
        },
      },
      userCourses: {
        include: {
          course: true,
        },
      },
      userLessons: {
        include: {
          lesson: true,
        },
      },
    },
  });
};

export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      purchased: {
        include: {
          course: true,
          resource: true,
        },
      },
      userCourses: {
        include: {
          course: true,
        },
      },
      userLessons: {
        include: {
          lesson: true,
        },
      },
      nip05: true,
      lightningAddress: true,
    },
  });
};

export const getUserByPubkey = async (pubkey) => {
  return await prisma.user.findUnique({
    where: { pubkey },
    include: {
      role: true,
      purchased: {
        include: {
          course: true,
          resource: true,
        },
      },
      userCourses: {
        include: {
          course: true,
        },
      },
      userLessons: {
        include: {
          lesson: true,
        },
      },
      nip05: true,
      lightningAddress: true,
    },
  });
}

export const addResourcePurchaseToUser = async (userId, purchaseData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      purchased: {
        create: {
          resourceId: purchaseData.resourceId,
          amountPaid: purchaseData.amountPaid,
        },
      },
    },
    include: {
      purchased: {
        include: {
          resource: true,
        },
      },
    },
  });
};

export const addCoursePurchaseToUser = async (userId, purchaseData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      purchased: {
        upsert: {
          where: {
            userId_courseId: {
              userId: userId,
              courseId: purchaseData.courseId,
            },
          },
          create: {
            courseId: purchaseData.courseId,
            amountPaid: purchaseData.amountPaid,
          },
          update: {
            amountPaid: purchaseData.amountPaid,
          },
        },
      },
    },
    include: {
      purchased: {
        include: {
          course: true,
        },
      },
    },
  });
};

export const createUser = async (data) => {
  return await prisma.user.create({
    data: {
      ...data,
      emailVerified: data.email ? new Date() : null,
    },
  });
};

export const updateUser = async (id, data) => {
  const updateData = { ...data };
  
  if (data.role) {
    updateData.role = {
      connect: { id: data.role }
    };
  }
  
  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
};

export const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const updateUserSubscription = async (userId, isSubscribed, nwc) => {
  const now = new Date();
  return await prisma.user.update({
    where: { id: userId },
    data: {
      role: {
        upsert: {
          create: {
            subscribed: isSubscribed,
            subscriptionStartDate: isSubscribed ? now : null,
            lastPaymentAt: isSubscribed ? now : null,
            nwc: nwc ? nwc : null,
            subscriptionExpiredAt: null,
          },
          update: {
            subscribed: isSubscribed,
            subscriptionStartDate: isSubscribed ? { set: now } : { set: null },
            lastPaymentAt: isSubscribed ? now : { set: null },
            nwc: nwc ? nwc : null,
            subscriptionExpiredAt: null,
          },
        },
      },
    },
    include: {
      role: true,
    },
  });
};

export const findExpiredSubscriptions = async () => {
  const now = new Date();
  const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);

  return await prisma.role.findMany({
    where: {
      subscribed: true,
      lastPaymentAt: {
        lt: thirtyOneDaysAgo
      }
    },
    select: {
      userId: true,
      nwc: true
    }
  });
};

export const expireUserSubscriptions = async (userIds) => {
  const now = new Date();
  const updatePromises = userIds.map((userId) =>
    prisma.role.update({
      where: { userId },
      data: {
        subscribed: false,
        subscriptionStartDate: null,
        lastPaymentAt: null,
        nwc: null,
        subscriptionExpiredAt: now,
      }
    })
  );

  await prisma.$transaction(updatePromises);
  return userIds.length;
};

export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      purchased: {
        include: {
          course: true,
          resource: true,
        },
      },
      userCourses: {
        include: {
          course: true,
        },
      },
      userLessons: {
        include: {
          lesson: true,
        },
      },
      nip05: true,
      lightningAddress: true,
    },
  });
};
