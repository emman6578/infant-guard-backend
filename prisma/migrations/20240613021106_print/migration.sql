/*
  Warnings:

  - Added the required column `weight` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `weight` DOUBLE NOT NULL,
    MODIFY `barcode` VARCHAR(191) NULL,
    MODIFY `unit_of_measure` ENUM('GRAMS', 'KILOGRAMS', 'LITERS', 'PIECES') NULL;
