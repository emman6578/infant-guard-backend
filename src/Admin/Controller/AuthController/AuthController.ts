import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateEmailToken } from "../../../Config/Token/generateEmailToken";
import { generateAuthToken } from "../../../Config/Token/generateAPIToken";
import { sendEmail } from "../../../Config/Email/sendEmail";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AdminInterface } from "../../Interface/AdminInterfaceRequest";
import {
  checkIfEmptyFields,
  checkRequiredFieldsAuth,
} from "../../Helpers/validateCheckRequiredFields_Auth";

import validator from "validator";

const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_TOKEN_EXPIRATION_HOURS = 360;

export const register = expressAsyncHandler(
  async (req: Request, res: Response) => {
    //checker
    checkRequiredFieldsAuth(req);
    checkIfEmptyFields(req);

    const admin: AdminInterface = req.body;

    if (!validator.isEmail(admin.email)) {
      throw new Error("Invalid email address");
    }

    const existingUser = await prisma.admin.findFirst({
      where: {
        OR: [{ username: admin.username }, { auth: { email: admin.email } }],
      },
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    const create = await prisma.admin.create({
      data: {
        fullname: admin.fullname,
        username: admin.username,
        auth: {
          create: {
            email: admin.email,
          },
        },
      },
      include: {
        auth: {
          select: { email: true },
        },
      },
    });

    const cart = await prisma.cart.create({
      data: {
        admin: {
          connect: {
            id: create.id,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Error creating user's cart");
    }

    if (!create) {
      throw new Error("Error creating user");
    }

    successHandler(create, res, "POST");
  }
);

export const createToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const admin: AdminInterface = req.body;

    //Generate token and set expiration
    const emailToken = generateEmailToken();
    const expiration = new Date(
      new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );

    if (!admin.email) {
      throw new Error("Empty email field");
    }

    if (!validator.isEmail(admin.email)) {
      throw new Error("Invalid email address");
    }

    const checkEmail = await prisma.auth.findUnique({
      where: { email: admin.email },
    });
    if (!checkEmail) {
      throw new Error("Please register first");
    }

    const createdTokenEmail = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        admin: {
          connect: {
            id: checkEmail.admin_id,
          },
        },
      },
    });

    successHandler(createdTokenEmail, res, "POST");

    const data = {
      to: admin.email,
      text: "Password Code",
      subject: "Login Code",
      htm: `This code <h1>${createdTokenEmail.emailToken}</h1> will expire in ${EMAIL_TOKEN_EXPIRATION_MINUTES} mins`,
    };

    sendEmail(data);
  }
);

export const authToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, emailToken } = req.body;

    const dbEmailToken = await prisma.token.findUnique({
      where: { emailToken },
      include: { admin: { include: { auth: true } } },
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

    if (dbEmailToken?.admin?.auth?.email !== email) {
      throw new Error("Unauthorized Access Register first");
    }

    const expiration = new Date(
      new Date().getTime() + API_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    const apiToken = await prisma.token.create({
      data: {
        type: "API",
        expiration,
        admin: { connect: { id: dbEmailToken.admin_id! } },
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
