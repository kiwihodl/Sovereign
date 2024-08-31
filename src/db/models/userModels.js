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
          },
          update: {
            subscribed: isSubscribed,
            subscriptionStartDate: isSubscribed ? { set: now } : { set: null },
            lastPaymentAt: isSubscribed ? now : { set: null },
            nwc: nwc ? nwc : null,
          },
        },
      },
    },
    include: {
      role: true,
    },
  });
};
