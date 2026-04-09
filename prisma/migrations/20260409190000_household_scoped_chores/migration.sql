ALTER TABLE "Chore"
ADD COLUMN "householdId" TEXT;

UPDATE "Chore" AS c
SET "householdId" = COALESCE(u."defaultHouseholdId", hm."householdId")
FROM "User" AS u
LEFT JOIN LATERAL (
    SELECT "householdId"
    FROM "HouseholdMember"
    WHERE "userId" = u."id"
    ORDER BY "id"
    LIMIT 1
) AS hm ON TRUE
WHERE c."createdById" = u."id"
  AND c."householdId" IS NULL;

ALTER TABLE "Chore"
ADD CONSTRAINT "Chore_householdId_fkey"
FOREIGN KEY ("householdId") REFERENCES "Household"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Chore_householdId_canonicalTitle_key"
ON "Chore"("householdId", "canonicalTitle");

CREATE INDEX "Chore_householdId_usageCount_lastUsedAt_idx"
ON "Chore"("householdId", "usageCount", "lastUsedAt");