-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_infant_id_fkey`;

-- AlterTable
ALTER TABLE `address` MODIFY `infant_id` VARCHAR(191) NULL,
    MODIFY `parent_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_infant_id_fkey` FOREIGN KEY (`infant_id`) REFERENCES `Infant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
