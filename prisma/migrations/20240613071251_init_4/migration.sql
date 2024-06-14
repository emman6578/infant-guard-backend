/*
  Warnings:

  - Added the required column `expected_sales_wholesale` to the `DriverLoad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `driverload` ADD COLUMN `expected_sales_wholesale` DOUBLE NOT NULL;
