/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `savings_category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "savings_category_type_key" ON "savings_category"("type");
