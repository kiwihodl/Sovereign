import prisma from "../prisma";

export const getAllUsers = async () => {
    return await prisma.user.findMany({
        include: {
            role: true, // Include related role
            purchased: {
                include: {
                    course: true, // Include course details in purchases
                    resource: true, // Include resource details in purchases
                },
            },
        },
    });
};

export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            role: true, // Include related role
            purchased: {
                include: {
                    course: true, // Include course details in purchases
                    resource: true, // Include resource details in purchases
                },
            },
        },
    });
};

export const getUserByPubkey = async (pubkey) => {
    return await prisma.user.findUnique({
        where: { pubkey },
        include: {
            role: true, // Include related role
            purchased: {
                include: {
                    course: true, // Include course details in purchases
                    resource: true, // Include resource details in purchases
                },
            },
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
          create: {
            courseId: purchaseData.courseId,
            amountPaid: purchaseData.amountPaid,
          },
        },
      },
    });
  };

export const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

export const updateUser = async (id, data) => {
    console.log("user modelllll", id, data)
    return await prisma.user.update({
        where: { id },
        data,
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

export const checkAndUpdateExpiredSubscriptions = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const expiredSubscriptions = await prisma.role.findMany({
      where: {
      subscribed: true,
      lastPaymentAt: {
        lt: fiveMinutesAgo
      }
    },
    select: {
      userId: true
    }
  });

  const updatePromises = expiredSubscriptions.map(({ userId }) =>
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

  return expiredSubscriptions.length;
};
