-- CreateEnum
CREATE TYPE "Type" AS ENUM ('EMAIL', 'API');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Parent', 'Admin');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "comparison" AS ENUM ('LATE', 'ON_TIME', 'EARLY');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONGOING', 'NOT_DONE', 'DONE');

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "address_id" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'Parent',
    "pushToken" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'EMAIL',
    "emailToken" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Birthday" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "purok" TEXT NOT NULL,
    "baranggay" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infant" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "birthday_id" TEXT,
    "place_of_birth" TEXT NOT NULL,
    "address_id" TEXT,
    "height" DOUBLE PRECISION NOT NULL,
    "gender" "Gender" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "mothers_name" TEXT NOT NULL,
    "fathers_name" TEXT NOT NULL,
    "health_center" TEXT NOT NULL,
    "family_no" INTEGER NOT NULL,
    "image" TEXT,
    "parent_id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination_Names" (
    "id" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "vaccine_type_code" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "once" TEXT NOT NULL,
    "twice" TEXT,
    "thrice" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_Names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination_Schedule" (
    "id" TEXT NOT NULL,
    "firstDose" TIMESTAMP(3),
    "secondDose" TIMESTAMP(3),
    "thirdDose" TIMESTAMP(3),
    "UpdateFirstDose" TIMESTAMP(3),
    "UpdateSecondDose" TIMESTAMP(3),
    "UpdateThirdDose" TIMESTAMP(3),
    "remark_FirstDose" TEXT,
    "remark_SecondDose" TEXT,
    "remark_ThirdDose" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "vaccination_Schedule_id" TEXT NOT NULL,
    "firstDoseStatus" "Status" NOT NULL,
    "secondDoseStatus" "Status",
    "thirdDoseStatus" "Status",
    "remarks" TEXT,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT,
    "body" TEXT,
    "data" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InfantToVaccination_Schedule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Vaccination_NamesToVaccination_Schedule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_contact_number_key" ON "Parent"("contact_number");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_parent_id_key" ON "Auth"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_emailToken_key" ON "Token"("emailToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vaccination_Names_vaccine_type_code_key" ON "Vaccination_Names"("vaccine_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "_InfantToVaccination_Schedule_AB_unique" ON "_InfantToVaccination_Schedule"("A", "B");

-- CreateIndex
CREATE INDEX "_InfantToVaccination_Schedule_B_index" ON "_InfantToVaccination_Schedule"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Vaccination_NamesToVaccination_Schedule_AB_unique" ON "_Vaccination_NamesToVaccination_Schedule"("A", "B");

-- CreateIndex
CREATE INDEX "_Vaccination_NamesToVaccination_Schedule_B_index" ON "_Vaccination_NamesToVaccination_Schedule"("B");

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infant" ADD CONSTRAINT "Infant_birthday_id_fkey" FOREIGN KEY ("birthday_id") REFERENCES "Birthday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infant" ADD CONSTRAINT "Infant_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infant" ADD CONSTRAINT "Infant_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_vaccination_Schedule_id_fkey" FOREIGN KEY ("vaccination_Schedule_id") REFERENCES "Vaccination_Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InfantToVaccination_Schedule" ADD CONSTRAINT "_InfantToVaccination_Schedule_A_fkey" FOREIGN KEY ("A") REFERENCES "Infant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InfantToVaccination_Schedule" ADD CONSTRAINT "_InfantToVaccination_Schedule_B_fkey" FOREIGN KEY ("B") REFERENCES "Vaccination_Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Vaccination_NamesToVaccination_Schedule" ADD CONSTRAINT "_Vaccination_NamesToVaccination_Schedule_A_fkey" FOREIGN KEY ("A") REFERENCES "Vaccination_Names"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Vaccination_NamesToVaccination_Schedule" ADD CONSTRAINT "_Vaccination_NamesToVaccination_Schedule_B_fkey" FOREIGN KEY ("B") REFERENCES "Vaccination_Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
