import { Prisma, PrismaClient, Status } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { checkFieldsInfantController } from "../../Helpers/checkFields";
import { InfantInterface } from "../../Interface/InfantInterface";
import cloudinary from "../../../utils/cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

export const infantLists = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infants = await prisma.infant.findMany({
      include: { address: true, birthday: true },
    });

    successHandler(infants, res, "GET");
  }
);

export const createInfant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const infant: InfantInterface = req.body;

    // Find or create the address
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
              purok: `Purok ${infant.address.purok}`,
              baranggay: infant.address.baranggay,
              municipality: infant.address.municipality,
              province: infant.address.province,
            },
          })
        ).id;

    // Get the contact number from the infant record
    const contact_info = infant.contact_number;

    // Check if the parent exists using a unique field (e.g., contact_number)
    const existingParent = await prisma.parent.findUnique({
      where: { contact_number: contact_info },
    });

    let parentId: string;

    if (existingParent) {
      // If parent exists, use its id
      parentId = existingParent.id;
    } else {
      const randomString = Array.from(
        { length: 4 },
        () => String.fromCharCode(97 + Math.floor(Math.random() * 26)) // Generates a random lowercase letter (a-z)
      ).join("");
      const dynamicEmail = `edit_this_email${randomString}@gmail.com`;
      const createParent = await prisma.parent.create({
        data: {
          fullname: infant.mothers_name,
          contact_number: contact_info,
          auth: {
            create: {
              email: dynamicEmail,
            },
          },
          address_id: addressId,
        },
      });
      parentId = createParent.id;
    }

    if (!parentId) {
      throw new Error("Parent id is not valid");
    }

    // Continue with checking duplicate infant record
    const existingInfant = await prisma.infant.findFirst({
      where: {
        fullname: infant.fullname,
        birthday: {
          month: infant.birthday.month,
          day: infant.birthday.day,
          year: infant.birthday.year,
        },
      },
    });

    if (existingInfant) {
      throw new Error("Duplicate infant record found.");
    }

    // Validate infant fields
    checkFieldsInfantController(infant);

    // Find or create the birthday record
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

    const existingParentAddress = await prisma.parent.findUnique({
      where: { contact_number: contact_info },
    });

    const existingParentAddressId = existingParentAddress?.address_id;

    // Finally, create the infant record
    const create = await prisma.infant.create({
      data: {
        fullname: infant.fullname,
        birthday_id: birthdayId,
        place_of_birth: infant.place_of_birth,
        address_id: existingParentAddressId,
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

export const uploadImgProfileInfant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const filePath = (req.file as Express.Multer.File).path;
    const { id } = req.params;

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "uploads", // Optional: organize images in folders
    });

    fs.unlinkSync(filePath);

    if (!result) {
      throw new Error("Image upload failed");
    }

    const infant = await prisma.infant.findUnique({
      where: { id },
    });

    if (!infant) {
      throw new Error(`Infant with ID ${id} not found`);
    }

    const imgUrl: string = result.secure_url;

    const updatedInfant = await prisma.infant.update({
      where: { id },
      data: {
        image: imgUrl,
      },
    });

    successHandler(imgUrl, res, "POST");
  }
);

export const deleteInfants = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      throw new Error("Invalid or missing IDs array");
    }

    const isValid = ids.every((id) => typeof id === "string");
    if (!isValid) {
      throw new Error("All IDs must be strings");
    }

    try {
      const result = await prisma.$transaction([
        // Delete Vaccination records
        prisma.vaccination.deleteMany({
          where: {
            vaccination_schedule: {
              infant: {
                some: {
                  id: { in: ids },
                },
              },
            },
          },
        }),

        // Delete Vaccination_Schedule records
        prisma.vaccination_Schedule.deleteMany({
          where: {
            infant: {
              some: {
                id: { in: ids },
              },
            },
          },
        }),

        // Delete Infant records
        prisma.infant.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        }),
      ]);

      successHandler(result[2].count, res, "DELETE"); // Only return the deleted infants count
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting infants and related records", error });
    }
  }
);

export const editInfants = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      fullname,
      address,
      place_of_birth,
      height,
      gender,
      weight,

      health_center,
      family_no,
    } = req.body;

    const updatedParent = await prisma.infant.update({
      where: { id },
      data: {
        fullname,
        address: {
          update: address,
        },
        place_of_birth,
        height,
        gender,
        weight,
        health_center,
        family_no,
      },
      include: {
        address: true,
      },
    });

    if (!updatedParent) {
      throw new Error("Failed to update the Infant details");
    }

    successHandler(updatedParent, res, "PUT");
  }
);

export const infantOne = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const infants = await prisma.infant.findUnique({
      where: { id: id },
      include: {
        address: true,
        birthday: true,
        Parent: {
          select: {
            id: true,
            fullname: true,
            auth: { select: { email: true } },
          },
        },
        Vaccination_Schedule: {
          include: { vaccine_names: true, Vaccination: true },
        },
      },
    });

    successHandler(infants, res, "GET");
  }
);

export const computeF1ScoreInfant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const infants = await prisma.infant.findMany({
      where: { id: id },
      include: {
        address: true,
        birthday: true,
        Parent: {
          select: {
            id: true,
            fullname: true,
            auth: { select: { email: true } },
          },
        },
        Vaccination_Schedule: {
          include: { vaccine_names: true, Vaccination: true },
        },
      },
    });

    successHandler(infants, res, "GET");
  }
);

export const updateVaccinationStatus = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id, doseType, status } = req.body;

    // Validate input
    if (!id || !doseType || !status) {
      throw new Error("Missing required fields: id, doseType, status");
    }

    // Validate doseType
    const validDoseTypes = [
      "firstDoseStatus",
      "secondDoseStatus",
      "thirdDoseStatus",
    ];
    if (!validDoseTypes.includes(doseType)) {
      throw new Error(
        `Invalid doseType. Must be one of: ${validDoseTypes.join(", ")}`
      );
    }

    // Validate status
    const validStatuses = ["NOT_DONE", "ONGOING", "DONE"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    try {
      // Fetch the vaccination record directly
      const vaccination = await prisma.vaccination.findUnique({
        where: { id },
        include: {
          vaccination_schedule: {
            include: {
              vaccine_names: true,
            },
          },
        },
      });

      if (!vaccination) {
        throw new Error("Vaccination record not found for this ID");
      }

      const frequencyOfVaccine =
        vaccination.vaccination_schedule.vaccine_names[0]?.frequency !==
        undefined
          ? vaccination.vaccination_schedule.vaccine_names[0].frequency
          : 3;

      // Update the vaccination record
      const updatedVaccination = await prisma.vaccination.update({
        where: { id },
        data: {
          [doseType]: status,
        },
      });

      // Fetch latest vaccination data
      const latestVaccination = await prisma.vaccination.findUnique({
        where: { id },
      });

      // Calculate new percentage based on completed doses
      let completedDoses = 0;

      if (
        frequencyOfVaccine >= 1 &&
        latestVaccination!.firstDoseStatus === "DONE"
      ) {
        completedDoses += 1;
      }
      if (
        frequencyOfVaccine >= 2 &&
        latestVaccination!.secondDoseStatus === "DONE"
      ) {
        completedDoses += 1;
      }
      if (
        frequencyOfVaccine >= 3 &&
        latestVaccination!.thirdDoseStatus === "DONE"
      ) {
        completedDoses += 1;
      }

      const newPercentage = Math.round(
        (completedDoses / frequencyOfVaccine) * 100
      );

      // Update percentage
      const finalVaccination = await prisma.vaccination.update({
        where: { id },
        data: { percentage: newPercentage },
        include: {
          vaccination_schedule: {
            include: {
              vaccine_names: true,
            },
          },
        },
      });

      successHandler(finalVaccination, res, "PUT");
    } catch (error: any) {
      throw new Error("Failed to update vaccination status: " + error.message);
    }
  }
);

export const findExpoPushToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { infant_id } = req.params;
    const { title, body, data } = req.body;

    const findPushToken = await prisma.infant.findUnique({
      where: { id: infant_id },
      select: {
        Parent: { select: { pushToken: true } },
      },
    });

    // Extract the pushToken from the nested Parent object
    const pushToken = findPushToken?.Parent?.pushToken || null;

    try {
      const notificationData = {
        to: pushToken,
        title,
        body,
        data: { data },
      };

      const response = await fetch(`https://exp.host/--/api/v2/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(notificationData),
      });

      successHandler("Successful", res, "GET");
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

export const updateVaccinationDate = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id, doseType, date } = req.body;

    // Validate required fields
    if (!id || !doseType || !date) {
      throw new Error("Missing required fields: id, doseType, date");
    }

    // Validate dose type
    const validDoseTypes = [
      "UpdateFirstDose",
      "UpdateSecondDose",
      "UpdateThirdDose",
    ];
    if (!validDoseTypes.includes(doseType)) {
      throw new Error(
        `Invalid doseType. Must be one of: ${validDoseTypes.join(", ")}`
      );
    }

    // Validate date format (MM-DD-YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new Error("Invalid date format. Please use MM-DD-YYYY.");
    }

    // Parse the date manually using Date.UTC (month is 0-indexed)
    const [monthStr, dayStr, yearStr] = date.split("-");
    const month = Number(monthStr);
    const day = Number(dayStr);
    const year = Number(yearStr);
    // Create the date in UTC so that "02-14-2025" is interpreted as "2025-02-14T00:00:00.000Z"
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date provided");
    }

    try {
      // Get the vaccination schedule
      const schedule = await prisma.vaccination_Schedule.findUnique({
        where: { id },
      });

      if (!schedule) {
        throw new Error("Vaccination schedule not found");
      }

      // Mapping object for dynamic property access
      const doseMapping: Record<string, { original: string; remark: string }> =
        {
          UpdateFirstDose: {
            original: "firstDose",
            remark: "remark_FirstDose",
          },
          UpdateSecondDose: {
            original: "secondDose",
            remark: "remark_SecondDose",
          },
          UpdateThirdDose: {
            original: "thirdDose",
            remark: "remark_ThirdDose",
          },
        };

      const mapping = doseMapping[doseType];
      if (!mapping) {
        throw new Error(`Dose mapping not found for doseType: ${doseType}`);
      }

      // Dynamically get the original dose date from the schedule.
      const originalDate = (schedule as { [key: string]: any })[
        mapping.original
      ] as Date | null;
      if (!originalDate) {
        throw new Error(`Original ${mapping.original} date is not set`);
      }

      // Remove time from the date objects for accurate date-only comparison.
      const originalDateOnly = new Date(originalDate);
      originalDateOnly.setUTCHours(0, 0, 0, 0);

      const updatedDateOnly = new Date(parsedDate);
      updatedDateOnly.setUTCHours(0, 0, 0, 0);

      // Compare dates: check equality first, then if earlier or later.
      let comparisonResult: "EARLY" | "ON_TIME" | "LATE";
      if (updatedDateOnly.getTime() === originalDateOnly.getTime()) {
        comparisonResult = "ON_TIME";
      } else if (updatedDateOnly < originalDateOnly) {
        comparisonResult = "EARLY";
      } else {
        comparisonResult = "LATE";
      }

      // Update the vaccination schedule with the new update date and remark.
      const updatedSchedule = await prisma.vaccination_Schedule.update({
        where: { id },
        data: {
          [doseType]: parsedDate,
          [mapping.remark]: comparisonResult,
        },
      });

      successHandler(updatedSchedule, res, "PUT");
    } catch (error: any) {
      throw new Error("Failed to update vaccination date: " + error.message);
    }
  }
);
