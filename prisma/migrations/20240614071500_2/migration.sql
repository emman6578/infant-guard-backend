/*
  Warnings:

  - You are about to drop the column `admin_id` on the `driverload` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `driverload` DROP FOREIGN KEY `DriverLoad_admin_id_fkey`;

-- AlterTable
ALTER TABLE `driverload` DROP COLUMN `admin_id`;

-- AlterTable
ALTER TABLE `driverloadproducts` ADD COLUMN `admin_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DriverLoadProducts` ADD CONSTRAINT `DriverLoadProducts_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
