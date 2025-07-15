/*
  Warnings:

  - You are about to drop the column `monthySavings` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "monthySavings",
ADD COLUMN     "monthyDeduction" INTEGER NOT NULL DEFAULT 0;
