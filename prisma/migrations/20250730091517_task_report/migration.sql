-- CreateTable
CREATE TABLE "tasks_report" (
    "id" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "completedCount" TEXT NOT NULL,
    "uncompletedCount" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "Memo" TEXT NOT NULL,

    CONSTRAINT "tasks_report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks_report" ADD CONSTRAINT "tasks_report_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
