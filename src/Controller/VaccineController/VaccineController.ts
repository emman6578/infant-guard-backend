import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

interface VaccineInterface {
  name: string;
  code: string;
  frequency: number;
  once: string;
  twice?: string;
  thrice?: string;
}

const prisma = new PrismaClient();

//TODO: chekers
//REMIND: This CRUD is only for the admin to add vaccine medicines in the database
export const create = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vaccine: VaccineInterface = req.body;

    const vaccineCode = await prisma.vaccination_Names.findUnique({
      where: {
        vaccine_type_code: vaccine.code,
      },
    });

    if (vaccineCode?.vaccine_type_code === vaccine.code) {
      throw new Error("Vaccine code duplication in the database...");
    }

    if (vaccine.frequency === 1) {
      const create = await prisma.vaccination_Names.create({
        data: {
          vaccine_name: vaccine.name,
          vaccine_type_code: vaccine.code,
          frequency: vaccine.frequency,
          once: vaccine.once,
        },
      });
    }

    if (vaccine.frequency === 2) {
      const vaccinationFrequencyTwice = await prisma.vaccination_Names.create({
        data: {
          vaccine_name: vaccine.name,
          vaccine_type_code: vaccine.code,
          frequency: vaccine.frequency,
          once: vaccine.once,
          twice: vaccine.twice,
        },
      });
    }

    if (vaccine.frequency === 3) {
      const vaccinationFrequencyThrice = await prisma.vaccination_Names.create({
        data: {
          vaccine_name: vaccine.name,
          vaccine_type_code: vaccine.code,
          frequency: vaccine.frequency,
          once: vaccine.once,
          twice: vaccine.twice,
          thrice: vaccine.thrice,
        },
      });
    }

    successHandler("Vaccine Successfully Created...", res, "POST");
  }
);
