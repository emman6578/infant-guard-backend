-- AlterTable
ALTER TABLE `order` MODIFY `total` DOUBLE NULL,
    MODIFY `wholesale_price_total` DOUBLE NULL,
    MODIFY `quantity` INTEGER NULL,
    MODIFY `address` VARCHAR(191) NULL;
