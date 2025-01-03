-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_courseId_fkey";

-- AlterTable
ALTER TABLE "Badge" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
