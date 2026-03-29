/*
  Warnings:

  - Added the required column `date` to the `TaskAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskAssignmentStatus" AS ENUM ('scheduled', 'completed', 'post_due');

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_choreId_fkey";

-- AlterTable
ALTER TABLE "TaskAssignment" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "TaskAssignmentStatus" NOT NULL DEFAULT 'scheduled',
ALTER COLUMN "choreId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
