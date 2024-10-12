/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,resourceId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Purchase_userId_courseId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_userId_courseId_resourceId_key" ON "Purchase"("userId", "courseId", "resourceId");
