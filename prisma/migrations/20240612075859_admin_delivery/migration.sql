-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `driver_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `Driver`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
