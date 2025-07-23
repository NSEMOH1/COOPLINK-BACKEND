/*
  Warnings:

  - The `identification` column on the `kyc_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profile_picture` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id_card` on the `kyc_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `signature` on the `kyc_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "kyc_info" DROP COLUMN "identification",
ADD COLUMN     "identification" BYTEA,
DROP COLUMN "id_card",
ADD COLUMN     "id_card" BYTEA NOT NULL,
DROP COLUMN "signature",
ADD COLUMN     "signature" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" BYTEA;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "canDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canView" BOOLEAN NOT NULL DEFAULT false;
