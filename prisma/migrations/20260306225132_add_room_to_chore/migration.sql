-- AlterTable
ALTER TABLE "Chore" ADD COLUMN     "roomId" TEXT;

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
