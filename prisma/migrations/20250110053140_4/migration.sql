/*
  Warnings:

  - You are about to drop the column `admin_id` on the `auth` table. All the data in the column will be lost.
  - You are about to drop the column `admin_id` on the `token` table. All the data in the column will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[User_id]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `User_id` to the `Auth` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auth` DROP FOREIGN KEY `Auth_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_admin_id_fkey`;

-- AlterTable
ALTER TABLE `auth` DROP COLUMN `admin_id`,
    ADD COLUMN `User_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `token` DROP COLUMN `admin_id`,
    ADD COLUMN `User_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `admin`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `contact_number` VARCHAR(191) NOT NULL,
    `baranggay` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('User', 'Admin') NOT NULL DEFAULT 'User',
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,
    `lastLogin` DATETIME(3) NULL,

    UNIQUE INDEX `User_contact_number_key`(`contact_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Auth_User_id_key` ON `Auth`(`User_id`);

-- AddForeignKey
ALTER TABLE `Auth` ADD CONSTRAINT `Auth_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
