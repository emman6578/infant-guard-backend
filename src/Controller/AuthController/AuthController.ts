import { Auth, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateEmailToken } from "../../Config/Token/generateEmailToken";
import { generateAuthToken } from "../../Config/Token/generateAPIToken";
import { sendEmail } from "../../Config/Email/sendEmail";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { ParentInterface } from "../../Interface/UserInterface";
import validator from "validator";
import { checkFieldsAuth } from "../../Helpers/checkFields";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_TOKEN_EXPIRATION_HOURS = 360;

export const register = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const parent: ParentInterface = req.body;

    checkFieldsAuth(parent);

    if (!validator.isEmail(parent.email)) {
      throw new Error("Invalid email address");
    }

    const existingUser = await prisma.parent.findFirst({
      where: {
        auth: { email: parent.email },
      },
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        purok: parent.address.purok,
        baranggay: parent.address.baranggay,
        municipality: parent.address.municipality,
        province: parent.address.province,
      },
    });

    const addressId = existingAddress
      ? existingAddress.id
      : (
          await prisma.address.create({
            data: {
              purok: parent.address.purok,
              baranggay: parent.address.baranggay,
              municipality: parent.address.municipality,
              province: parent.address.province,
            },
          })
        ).id;

    const isThisUserExist = await prisma.parent.findUnique({
      where: {
        contact_number: parent.contact_number,
      },
      include: { address: true, auth: true },
    });

    if (isThisUserExist) {
      try {
        await prisma.parent.update({
          where: { id: isThisUserExist.id },
          data: {
            auth: {
              update: { email: parent.email },
            },
          },
        });
        successHandler("Updated Successfully", res, "POST");
      } catch (error: any) {
        throw new Error(error);
      }
    }

    const create = await prisma.parent.create({
      data: {
        fullname: parent.fullname,
        contact_number: parent.contact_number,
        address_id: addressId,
        auth: {
          create: {
            email: parent.email,
          },
        },
      },

      include: {
        auth: {
          select: { email: true },
        },
      },
    });

    if (!create) {
      throw new Error("Error creating user");
    }

    successHandler(create, res, "POST");
  }
);

export const createToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const parent: ParentInterface = req.body;

    const emailToken = generateEmailToken();
    const expiration = new Date(
      new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );

    if (!parent.email) {
      throw new Error("Empty email field");
    }

    if (!validator.isEmail(parent.email)) {
      throw new Error("Invalid email address");
    }

    const checkEmail = await prisma.auth.findUnique({
      where: { email: parent.email },
    });
    if (!checkEmail) {
      throw new Error("Please register first");
    }

    const createdTokenEmail = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        Parent: {
          connect: {
            id: checkEmail.parent_id,
          },
        },
      },
    });

    try {
      const data = {
        to: parent.email,
        text: "Password Code",
        subject: "Login Code",
        htm: `This code <h1>${createdTokenEmail.emailToken}</h1> will expire in ${EMAIL_TOKEN_EXPIRATION_MINUTES} mins`,
      };

      await sendEmail(data);
      successHandler(createdTokenEmail, res, "POST");
    } catch (error) {
      throw new Error("Failed to send email" + error);
    }
  }
);

export const authToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, emailToken } = req.body;

    const dbEmailToken = await prisma.token.findUnique({
      where: { emailToken },
      include: { Parent: { include: { auth: true } } },
    });

    if (!email || !emailToken) {
      throw new Error("Empty field");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Invalid email address");
    }

    if (!dbEmailToken || !dbEmailToken?.valid) {
      throw new Error("Unathorized Access");
    }

    if (dbEmailToken!.expiration < new Date()) {
      throw new Error("Unathorized Access: Token expired");
    }

    if (dbEmailToken?.Parent?.auth?.email !== email) {
      throw new Error("Unauthorized Access Register first");
    }

    const expiration = new Date(
      new Date().getTime() + API_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    const apiToken = await prisma.token.create({
      data: {
        type: "API",
        expiration,
        Parent: { connect: { id: dbEmailToken.parent_id! } },
      },
    });

    await prisma.token.update({
      where: {
        id: dbEmailToken?.id,
      },
      data: {
        valid: false,
      },
    });

    const authToken = generateAuthToken(apiToken.id);

    res.json({ authToken });
  }
);
