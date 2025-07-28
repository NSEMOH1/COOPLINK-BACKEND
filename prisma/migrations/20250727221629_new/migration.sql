/*
  Warnings:

  - The `signature` column on the `kyc_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profile_picture` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `identification` to the `kyc_info` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id_card` on the `kyc_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "kyc_info" DROP COLUMN "identification",
ADD COLUMN     "identification" JSONB NOT NULL,
DROP COLUMN "id_card",
ADD COLUMN     "id_card" JSONB NOT NULL,
DROP COLUMN "signature",
ADD COLUMN     "signature" JSONB;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" JSONB;

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "memberId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
