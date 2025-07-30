-- AlterEnum
ALTER TYPE "TaskType" ADD VALUE 'REPORT';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "memberId" TEXT;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
