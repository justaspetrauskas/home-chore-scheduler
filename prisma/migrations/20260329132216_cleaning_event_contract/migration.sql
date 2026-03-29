/*
  Warnings:

  - You are about to drop the column `createdById` on the `CleaningEvent` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `CleaningEvent` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `CleaningEvent` table. All the data in the column will be lost.
  - Added the required column `createdByUserId` to the `CleaningEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `CleaningEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CleaningEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notificationDate` to the `CleaningEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CleaningEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DistributionMode" AS ENUM ('random', 'balanced');

-- CreateEnum
CREATE TYPE "RecurrenceRule" AS ENUM ('none', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "CleaningEventStatus" AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'canceled');

-- AlterTable
ALTER TABLE "CleaningEvent" DROP COLUMN "createdById",
DROP COLUMN "date",
DROP COLUMN "title",
ADD COLUMN     "createdByUserId" TEXT NOT NULL,
ADD COLUMN     "distributionMode" "DistributionMode" NOT NULL DEFAULT 'random',
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notificationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notifyParticipants" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recurrenceRule" "RecurrenceRule" NOT NULL DEFAULT 'none',
ADD COLUMN     "status" "CleaningEventStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "CleaningEvent" ADD CONSTRAINT "CleaningEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
