import prisma from '../prisma';
import { SUBSCRIPTION_PERIODS } from '@/constants/subscriptionPeriods';

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
      userBadges: {
        include: {
          badge: true,
        },
      },
    },
  });
};

export const getUserById = async id => {
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
      platformNip05: true,
      platformLightningAddress: true,
      userBadges: {
        include: {
          badge: true,
        },
      },
    },
  });
};

export const getUserByPubkey = async pubkey => {
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
      platformNip05: true,
      platformLightningAddress: true,
      userBadges: {
        include: {
          badge: true,
        },
      },
    },
  });
};

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
    include: {
      purchased: {
        include: {
          course: true,
        },
      },
    },
  });
};

export const createUser = async data => {
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
      connect: { id: data.role },
    };
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
};

export const deleteUser = async id => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const updateUserSubscription = async (userId, isSubscribed, nwc, subscriptionType = 'monthly') => {
  try {
    const now = new Date();
    return await prisma.user.update({
      where: { id: userId },
      data: {
        role: {
          upsert: {
            create: {
              subscribed: isSubscribed,
              subscriptionType: subscriptionType,
              subscriptionStartDate: isSubscribed ? now : null,
              lastPaymentAt: isSubscribed ? now : null,
              nwc: nwc ? nwc : null,
              subscriptionExpiredAt: null,
            },
            update: {
              subscribed: isSubscribed,
              subscriptionType: subscriptionType,
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
  } finally {
    await prisma.$disconnect();
  }
};

export const findExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Use the constants for expiration periods
    const monthlyExpiration = new Date(
      now.getTime() - 
      (SUBSCRIPTION_PERIODS.MONTHLY.DAYS * 24 * 60 * 60 * 1000) - 
      (SUBSCRIPTION_PERIODS.MONTHLY.BUFFER_HOURS * 60 * 60 * 1000)
    );
    const yearlyExpiration = new Date(
      now.getTime() - 
      (SUBSCRIPTION_PERIODS.YEARLY.DAYS * 24 * 60 * 60 * 1000) - 
      (SUBSCRIPTION_PERIODS.YEARLY.BUFFER_HOURS * 60 * 60 * 1000)
    );

    // Find expired subscriptions of both types
    const result = await prisma.role.findMany({
      where: {
        subscribed: true,
        OR: [
          {
            subscriptionType: 'monthly',
            lastPaymentAt: { lt: monthlyExpiration }
          },
          {
            subscriptionType: 'yearly', 
            lastPaymentAt: { lt: yearlyExpiration }
          }
        ]
      },
      select: {
        userId: true,
        nwc: true,
        subscriptionType: true,
        subscriptionExpiredAt: true,
        subscriptionStartDate: true,
        admin: true,
      },
    });

    return result;
  } finally {
    await prisma.$disconnect();
  }
};

export const expireUserSubscriptions = async userIds => {
  try {
    const now = new Date();
    
    // First, get the subscription types for each userId
    const subscriptions = await prisma.role.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        subscriptionType: true,
      },
    });
    
    // Create a map of userId to subscription type
    const subscriptionTypes = {};
    subscriptions.forEach(sub => {
      subscriptionTypes[sub.userId] = sub.subscriptionType || 'monthly';
    });
    
    const updatePromises = userIds.map(userId =>
      prisma.role.update({
        where: { userId },
        data: {
          subscribed: false,
          subscriptionStartDate: null,
          lastPaymentAt: null,
          nwc: null,
          subscriptionExpiredAt: now,
          // Keep the subscription type for historical data and easy renewal
          // subscriptionType: Don't change the existing value
        },
      })
    );

    await prisma.$transaction(updatePromises);
    return userIds.length;
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserByEmail = async email => {
  if (!email || typeof email !== 'string') {
    console.error('Invalid email parameter:', email);
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
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
        platformNip05: true,
        platformLightningAddress: true,
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
};
