/*
  Warnings:

  - A unique constraint covering the columns `[admin_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Order_admin_id_key` ON `Order`(`admin_id`);
