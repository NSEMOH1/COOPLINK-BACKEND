/*
  Warnings:

  - Added the required column `updatedAt` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
