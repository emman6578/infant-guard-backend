import { PrismaClient, Admin } from "@prisma/client";
import { Request, Response } from "express";
import { generateEmailToken } from "../../../Config/Token/generateEmailToken";
import { generateAuthToken } from "../../../Config/Token/generateAPIToken";
import { sendEmail } from "../../../Config/Email/sendEmail";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { DriverInterface } from "../../Interface/DriverInterfaceRequest";

const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_TOKEN_EXPIRATION_HOURS = 360;

export const driverRegister = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const driver: DriverInterface = req.body;

    const create = await prisma.driver.create({
      data: {
        fullname: driver.fullname,
        email: driver.email,
      },
    });

    const DriverLoad = await prisma.driverLoad.create({
      data: {
        driver: {
          connect: {
            id: create.id,
          },
        },
      },
    });

    if (!create) {
      throw new Error("Error creating user");
    }

    if (!DriverLoad) {
      throw new Error("Error creating driver load");
    }

    successHandler(create, res, "POST");
  }
);

export const driverLogin = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const driver: DriverInterface = req.body;

    //Generate token and set expiration
    const emailToken = generateEmailToken();
    const expiration = new Date(
      new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );

    const checkEmail = await prisma.driver.findUnique({
      where: { email: driver.email },
    });

    if (!checkEmail) {
      throw new Error("This email address is not valid");
    }

    const createdTokenEmail = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        Driver: {
          connect: {
            id: checkEmail.id,
          },
        },
      },
    });

    successHandler(createdTokenEmail, res, "POST");

    const data = {
      to: driver.email,
      text: "Password Code for Driver",
      subject: "Login Code for Driver",
      htm: `This code is for driver <h1>${createdTokenEmail.emailToken}</h1> will expire in ${EMAIL_TOKEN_EXPIRATION_MINUTES} mins`,
    };

    sendEmail(data);
  }
);

export const driverAuthenticate = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, emailToken } = req.body;

    const dbEmailToken = await prisma.token.findUnique({
      where: { emailToken },
      include: { Driver: true },
    });

    if (!dbEmailToken || !dbEmailToken?.valid) {
      throw new Error("Unathorized Access");
    }

    if (dbEmailToken!.expiration < new Date()) {
      throw new Error("Unathorized Access: Token expired");
    }

    if (dbEmailToken?.Driver?.email !== email) {
      throw new Error("Unauthorized Access Register first");
    }

    const expiration = new Date(
      new Date().getTime() + API_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    const apiToken = await prisma.token.create({
      data: {
        type: "API",
        expiration,
        Driver: { connect: { id: dbEmailToken.driverId! } },
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
