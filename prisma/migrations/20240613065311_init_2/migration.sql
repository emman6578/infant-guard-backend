/*
  Warnings:

  - Added the required column `wholesale_price_total` to the `ProductInCart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productincart` ADD COLUMN `wholesale_price_total` DOUBLE NOT NULL;
