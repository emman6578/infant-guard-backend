import { Gender, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { InfantInterface } from "../../Interface/InfantInterface";
import { checkFieldsInfantController } from "../../Helpers/checkFields";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

//TODO: add logic here or checkers
export const create = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infant: InfantInterface = req.body;

    checkFieldsInfantController(infant);

    const existingAddress = await prisma.address.findFirst({
      where: {
        purok: infant.address.purok,
        baranggay: infant.address.baranggay,
        municipality: infant.address.municipality,
        province: infant.address.province,
      },
    });

    const addressId = existingAddress
      ? existingAddress.id
      : (
          await prisma.address.create({
            data: {
              purok: infant.address.purok,
              baranggay: infant.address.baranggay,
              municipality: infant.address.municipality,
              province: infant.address.province,
            },
          })
        ).id;

    const existingBirthday = await prisma.birthday.findFirst({
      where: {
        month: infant.birthday.month,
        day: infant.birthday.day,
        year: infant.birthday.year,
      },
    });

    const birthdayId = existingBirthday
      ? existingBirthday.id
      : (
          await prisma.birthday.create({
            data: {
              month: infant.birthday.month,
              day: infant.birthday.day,
              year: infant.birthday.year,
            },
          })
        ).id;

    //getting parent id from the middleware
    const parentId = req.parent?.id;

    if (!parentId) {
      throw new Error("Parent id is not valid");
    }

    const create = await prisma.infant.create({
      data: {
        fullname: infant.fullname,
        birthday_id: birthdayId,
        place_of_birth: infant.place_of_birth,
        address_id: addressId,
        height: infant.height,
        gender: infant.gender,
        weight: infant.weight,
        mothers_name: infant.mothers_name,
        fathers_name: infant.fathers_name,
        health_center: infant.health_center,
        family_no: infant.family_no,
        parent_id: parentId,
      },
    });

    if (!create) {
      throw new Error("Error creating infant");
    }

    successHandler(create, res, "POST");
  }
);
