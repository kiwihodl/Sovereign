import prisma from '@/db/prisma';

export const getAllLightningAddresses = async () => {
  return await prisma.platformLightningAddress.findMany();
};

export const getLightningAddressByName = async name => {
  return await prisma.platformLightningAddress.findFirst({
    where: { name },
  });
};

export const getLightningAddress = async userId => {
  return await prisma.platformLightningAddress.findUnique({
    where: { userId },
  });
};

export const createLightningAddress = async (
  userId,
  name,
  description,
  maxSendable,
  minSendable,
  invoiceMacaroon,
  lndCert,
  lndHost,
  lndPort
) => {
  try {
    return await prisma.platformLightningAddress.create({
      data: {
        userId,
        name,
        description,
        maxSendable: maxSendable,
        minSendable: minSendable,
        invoiceMacaroon,
        lndCert,
        lndHost,
        lndPort,
      },
    });
  } catch (error) {
    console.error('Error in createLightningAddress:', error);
    throw error;
  }
};

export const updateLightningAddress = async (userId, data) => {
  return await prisma.platformLightningAddress.update({
    where: { userId },
    data,
  });
};

export const deleteLightningAddress = async userId => {
  return await prisma.platformLightningAddress.delete({
    where: { userId },
  });
};
