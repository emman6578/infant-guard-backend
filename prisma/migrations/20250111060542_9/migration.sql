/*
  Warnings:

  - A unique constraint covering the columns `[parent_id]` on the table `Infant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Infant_parent_id_key` ON `Infant`(`parent_id`);
