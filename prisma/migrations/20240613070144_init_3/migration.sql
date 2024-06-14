/*
  Warnings:

  - Added the required column `wholesale_price_total` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `delivery` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `delivery` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `wholesale_price_total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `wholesale_price_total` DOUBLE NOT NULL,
    MODIFY `quantity` INTEGER NOT NULL,
    MODIFY `total` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `wholesale_price_total` DOUBLE NOT NULL;
