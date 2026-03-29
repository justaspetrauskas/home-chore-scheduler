-- CreateTable
CREATE TABLE "CleaningEventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CleaningEventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CleaningEventParticipant_eventId_userId_key" ON "CleaningEventParticipant"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "CleaningEventParticipant" ADD CONSTRAINT "CleaningEventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CleaningEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningEventParticipant" ADD CONSTRAINT "CleaningEventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
