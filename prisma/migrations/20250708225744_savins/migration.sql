/*
  Warnings:

  - The values [NORMAL_SAVINGS] on the enum `SavingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SavingType_new" AS ENUM ('QUICK', 'COOPERATIVE');
ALTER TABLE "savings_category" ALTER COLUMN "type" TYPE "SavingType_new" USING ("type"::text::"SavingType_new");
ALTER TYPE "SavingType" RENAME TO "SavingType_old";
ALTER TYPE "SavingType_new" RENAME TO "SavingType";
DROP TYPE "SavingType_old";
COMMIT;
