/*
  Warnings:

  - You are about to drop the column `user` on the `tasks_report` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `tasks_report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `tasks_report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tasks_report" DROP CONSTRAINT "tasks_report_user_fkey";

-- AlterTable
ALTER TABLE "tasks_report" DROP COLUMN "user",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks_report" ADD CONSTRAINT "tasks_report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
