/*
  Warnings:

  - You are about to alter the column `monthlyDeduction` on the `members` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "totalSavings" SET DEFAULT 0,
ALTER COLUMN "totalSavings" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "monthlyDeduction" SET DEFAULT 0,
ALTER COLUMN "monthlyDeduction" SET DATA TYPE DECIMAL(10,2);
