/*
  Warnings:

  - You are about to alter the column `amount` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `approvedAmount` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to drop the column `service_number` on the `personel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "personel_service_number_key";

-- AlterTable
ALTER TABLE "loans" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "approvedAmount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "service_number" TEXT;

-- AlterTable
ALTER TABLE "personel" DROP COLUMN "service_number";

-- CreateIndex
CREATE INDEX "loans_memberId_idx" ON "loans"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "members_service_number_key" ON "members"("service_number");
