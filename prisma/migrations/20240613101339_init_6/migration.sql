/*
  Warnings:

  - You are about to drop the column `wholesale_price_total` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `driver_id` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the `_deliveryproductstoproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deliveryproducts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wholesale_price_total` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_deliveryproductstoproduct` DROP FOREIGN KEY `_DeliveryProductsToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_deliveryproductstoproduct` DROP FOREIGN KEY `_DeliveryProductsToProduct_B_fkey`;

-- DropForeignKey
ALTER TABLE `delivery` DROP FOREIGN KEY `Delivery_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `deliveryproducts` DROP FOREIGN KEY `DeliveryProducts_delivery_id_fkey`;

-- AlterTable
ALTER TABLE `cart` DROP COLUMN `wholesale_price_total`,
    ADD COLUMN `wholesale_price` DOUBLE NULL;

-- AlterTable
ALTER TABLE `delivery` DROP COLUMN `driver_id`,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL,
    ADD COLUMN `wholesale_price_total` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `_deliveryproductstoproduct`;

-- DropTable
DROP TABLE `deliveryproducts`;

-- CreateTable
CREATE TABLE `_DeliveryToProduct` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DeliveryToProduct_AB_unique`(`A`, `B`),
    INDEX `_DeliveryToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_DeliveryToProduct` ADD CONSTRAINT `_DeliveryToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `Delivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DeliveryToProduct` ADD CONSTRAINT `_DeliveryToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
