/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_memberId_fkey";

-- DropTable
DROP TABLE "Request";

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "memberId" TEXT,
    "status" "RequestStatus" NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
