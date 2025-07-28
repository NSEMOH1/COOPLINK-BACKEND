/*
  Warnings:

  - Made the column `signature` on table `kyc_info` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profile_picture` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "kyc_info" ALTER COLUMN "identification" SET DATA TYPE TEXT,
ALTER COLUMN "id_card" SET DATA TYPE TEXT,
ALTER COLUMN "signature" SET NOT NULL,
ALTER COLUMN "signature" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "profile_picture" SET NOT NULL,
ALTER COLUMN "profile_picture" SET DATA TYPE TEXT;
