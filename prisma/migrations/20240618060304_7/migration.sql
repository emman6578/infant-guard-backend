-- AlterTable
ALTER TABLE `driversales` ADD COLUMN `paymentStatus` ENUM('PAID', 'UNPAID', 'PROCESSING') NULL;
