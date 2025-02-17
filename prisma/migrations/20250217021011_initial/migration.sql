-- AlterTable
ALTER TABLE "_InfantToVaccination_Schedule" ADD CONSTRAINT "_InfantToVaccination_Schedule_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InfantToVaccination_Schedule_AB_unique";

-- AlterTable
ALTER TABLE "_Vaccination_NamesToVaccination_Schedule" ADD CONSTRAINT "_Vaccination_NamesToVaccination_Schedule_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Vaccination_NamesToVaccination_Schedule_AB_unique";
