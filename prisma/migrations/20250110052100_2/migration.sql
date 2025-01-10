/*
  Warnings:

  - You are about to drop the column `driverId` on the `token` table. All the data in the column will be lost.
  - You are about to drop the `_categorytoproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driverload` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driverloadproducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driversales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderproducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productincart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salesreport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salesreportproducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salesummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_categorytoproduct` DROP FOREIGN KEY `_CategoryToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_categorytoproduct` DROP FOREIGN KEY `_CategoryToProduct_B_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `driverload` DROP FOREIGN KEY `DriverLoad_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `driverloadproducts` DROP FOREIGN KEY `DriverLoadProducts_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `driverloadproducts` DROP FOREIGN KEY `DriverLoadProducts_driverLoad_id_fkey`;

-- DropForeignKey
ALTER TABLE `driverloadproducts` DROP FOREIGN KEY `DriverLoadProducts_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `driversales` DROP FOREIGN KEY `DriverSales_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `driversales` DROP FOREIGN KEY `DriverSales_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `driversales` DROP FOREIGN KEY `DriverSales_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderproducts` DROP FOREIGN KEY `OrderProducts_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderproducts` DROP FOREIGN KEY `OrderProducts_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productincart` DROP FOREIGN KEY `ProductInCart_cart_id_fkey`;

-- DropForeignKey
ALTER TABLE `productincart` DROP FOREIGN KEY `ProductInCart_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `salesreport` DROP FOREIGN KEY `SalesReport_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `salesreportproducts` DROP FOREIGN KEY `SalesReportProducts_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreportproducts` DROP FOREIGN KEY `SalesReportProducts_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `salesreportproducts` DROP FOREIGN KEY `SalesReportProducts_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `salesreportproducts` DROP FOREIGN KEY `SalesReportProducts_salesReportId_fkey`;

-- DropForeignKey
ALTER TABLE `salesummary` DROP FOREIGN KEY `SaleSummary_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `salesummary` DROP FOREIGN KEY `SaleSummary_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `salesummary` DROP FOREIGN KEY `SaleSummary_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_driverId_fkey`;

-- AlterTable
ALTER TABLE `token` DROP COLUMN `driverId`;

-- DropTable
DROP TABLE `_categorytoproduct`;

-- DropTable
DROP TABLE `cart`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `customer`;

-- DropTable
DROP TABLE `driver`;

-- DropTable
DROP TABLE `driverload`;

-- DropTable
DROP TABLE `driverloadproducts`;

-- DropTable
DROP TABLE `driversales`;

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `orderproducts`;

-- DropTable
DROP TABLE `product`;

-- DropTable
DROP TABLE `productincart`;

-- DropTable
DROP TABLE `salesreport`;

-- DropTable
DROP TABLE `salesreportproducts`;

-- DropTable
DROP TABLE `salesummary`;
