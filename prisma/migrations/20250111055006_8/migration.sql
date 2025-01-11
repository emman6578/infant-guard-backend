/*
  Warnings:

  - You are about to drop the column `infant_id` on the `birthday` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `birthday` DROP FOREIGN KEY `Birthday_infant_id_fkey`;

-- AlterTable
ALTER TABLE `birthday` DROP COLUMN `infant_id`;

-- AlterTable
ALTER TABLE `infant` ADD COLUMN `birthday_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Infant` ADD CONSTRAINT `Infant_birthday_id_fkey` FOREIGN KEY (`birthday_id`) REFERENCES `Birthday`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
