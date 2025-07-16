-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "memberId" TEXT,
    "status" "RequestStatus" NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
