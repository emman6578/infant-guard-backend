/*
  Warnings:

  - You are about to drop the column `baranggay` on the `parent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `parent` DROP COLUMN `baranggay`;

-- CreateTable
CREATE TABLE `Infant` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `place_of_birth` VARCHAR(191) NOT NULL,
    `height` INTEGER NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `weight` INTEGER NOT NULL,
    `mothers_name` VARCHAR(191) NOT NULL,
    `fathers_name` VARCHAR(191) NOT NULL,
    `health_center` VARCHAR(191) NOT NULL,
    `family_no` INTEGER NOT NULL,
    `image` VARCHAR(191) NULL,
    `immunization_progress` VARCHAR(191) NULL,
    `immunization_status` VARCHAR(191) NULL,
    `immunization_vaccine` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Birthday` (
    `id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `day` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `infant_id` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Birthday_infant_id_key`(`infant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `purok` VARCHAR(191) NOT NULL,
    `municipality` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `infant_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Address_infant_id_key`(`infant_id`),
    UNIQUE INDEX `Address_parent_id_key`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Infant` ADD CONSTRAINT `Infant_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birthday` ADD CONSTRAINT `Birthday_infant_id_fkey` FOREIGN KEY (`infant_id`) REFERENCES `Infant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_infant_id_fkey` FOREIGN KEY (`infant_id`) REFERENCES `Infant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
