/*
  Warnings:

  - You are about to drop the column `monthyDeduction` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "monthyDeduction",
ADD COLUMN     "monthlyDeduction" INTEGER NOT NULL DEFAULT 0;
