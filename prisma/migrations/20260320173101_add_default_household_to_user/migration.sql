-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultHouseholdId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultHouseholdId_fkey" FOREIGN KEY ("defaultHouseholdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;
