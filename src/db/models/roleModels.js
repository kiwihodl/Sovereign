import prisma from '../prisma';

export const createRole = async data => {
  return await prisma.role.create({
    data: {
      user: { connect: { id: data.userId } },
      admin: data.admin,
      subscribed: data.subscribed,
      subscriptionType: data.subscriptionType || 'monthly',
      // Add other fields as needed, with default values or null if not provided
      subscriptionStartDate: null,
      lastPaymentAt: null,
      subscriptionExpiredAt: null,
      nwc: null,
    },
  });
};
