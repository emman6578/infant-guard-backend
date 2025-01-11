/*
  Warnings:

  - You are about to alter the column `height` on the `infant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `weight` on the `infant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `infant` MODIFY `height` DOUBLE NOT NULL,
    MODIFY `weight` DOUBLE NOT NULL;
