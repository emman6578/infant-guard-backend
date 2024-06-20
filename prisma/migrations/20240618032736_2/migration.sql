/*
  Warnings:

  - You are about to drop the column `total` on the `driverloadproducts` table. All the data in the column will be lost.
  - You are about to drop the column `wholesale_total` on the `driverloadproducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `driverloadproducts` DROP COLUMN `total`,
    DROP COLUMN `wholesale_total`;
