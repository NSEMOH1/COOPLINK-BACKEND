/*
  Warnings:

  - You are about to alter the column `amount` on the `savings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.

*/
-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "lga" DROP DEFAULT;

-- AlterTable
ALTER TABLE "savings" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);
