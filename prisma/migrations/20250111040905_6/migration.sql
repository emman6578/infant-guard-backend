/*
  Warnings:

  - You are about to drop the column `infant_id` on the `address` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_infant_id_fkey`;

-- AlterTable
ALTER TABLE `address` DROP COLUMN `infant_id`;

-- AlterTable
ALTER TABLE `infant` ADD COLUMN `address_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Infant` ADD CONSTRAINT `Infant_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
