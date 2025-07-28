-- DropIndex
DROP INDEX "next_of_kin_email_key";

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "date_of_birth" DROP DEFAULT;

-- AlterTable
ALTER TABLE "next_of_kin" ADD COLUMN     "civilianId" TEXT;

-- AddForeignKey
ALTER TABLE "next_of_kin" ADD CONSTRAINT "next_of_kin_civilianId_fkey" FOREIGN KEY ("civilianId") REFERENCES "civilian"("id") ON DELETE SET NULL ON UPDATE CASCADE;
