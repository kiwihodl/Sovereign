/*
  Warnings:

  - You are about to drop the `LightningAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nip05` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LightningAddress" DROP CONSTRAINT "LightningAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Nip05" DROP CONSTRAINT "Nip05_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lud16" TEXT,
ADD COLUMN     "nip05" TEXT;

-- DropTable
DROP TABLE "LightningAddress";

-- DropTable
DROP TABLE "Nip05";

-- CreateTable
CREATE TABLE "PlatformNip05" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformNip05_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLightningAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowsNostr" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "maxSendable" INTEGER NOT NULL DEFAULT 10000000,
    "minSendable" INTEGER NOT NULL DEFAULT 1,
    "invoiceMacaroon" TEXT NOT NULL,
    "lndCert" TEXT,
    "lndHost" TEXT NOT NULL,
    "lndPort" TEXT NOT NULL DEFAULT '8080',

    CONSTRAINT "PlatformLightningAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformNip05_userId_key" ON "PlatformNip05"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformLightningAddress_userId_key" ON "PlatformLightningAddress"("userId");

-- AddForeignKey
ALTER TABLE "PlatformNip05" ADD CONSTRAINT "PlatformNip05_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLightningAddress" ADD CONSTRAINT "PlatformLightningAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
