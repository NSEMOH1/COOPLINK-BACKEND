/*
  Warnings:

  - The values [LOAN_PENDING] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `amount` on the `repayments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'SAVINGS_DEPOSIT', 'SAVINGS_WITHDRAWAL', 'FEE', 'ADJUSTMENT', 'LOAN_APPROVED', 'LOAN_REJECTED', 'PENDING');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "repayments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);
