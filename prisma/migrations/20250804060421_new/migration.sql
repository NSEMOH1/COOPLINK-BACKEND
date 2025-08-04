/*
  Warnings:

  - You are about to drop the column `totalSavings` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "totalSavings";

-- CreateTable
CREATE TABLE "termination" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "termination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "termination" ADD CONSTRAINT "termination_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
