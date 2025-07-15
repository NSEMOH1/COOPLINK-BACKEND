-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'PENDING';
