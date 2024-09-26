import prisma from "@/db/prisma";

export const getAllLightningAddresses = async () => {
    return await prisma.lightningAddress.findMany();
};

export const getLightningAddressByName = async (name) => {
    return await prisma.lightningAddress.findFirst({
        where: { name },
    });
};

export const getLightningAddress = async (userId) => {
    return await prisma.lightningAddress.findUnique({
        where: { userId },
    });
};

export const createLightningAddress = async (userId, name, description, maxSendable, minSendable, invoiceMacaroon, lndCert, lndHost, lndPort) => {
    try {
        return await prisma.lightningAddress.create({
            data: { 
                userId, 
                name, 
                description, 
                maxSendable: maxSendable, 
                minSendable: minSendable, 
                invoiceMacaroon, 
                lndCert, 
                lndHost, 
                lndPort 
            },
        });
    } catch (error) {
        console.error('Error in createLightningAddress:', error);
        throw error;
    }
};

export const updateLightningAddress = async (userId, data) => {
    return await prisma.lightningAddress.update({
        where: { userId },
        data,
    });
};

export const deleteLightningAddress = async (userId) => {
    return await prisma.lightningAddress.delete({
        where: { userId },
    });
};
