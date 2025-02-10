import { Gender, PrismaClient, Status } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { InfantInterface } from "../../Interface/InfantInterface";
import { checkFieldsInfantController } from "../../Helpers/checkFields";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { calculateAge } from "./ParentControllerHelpers/CalculateAge";
import { CalculateDayFromBday } from "./ParentControllerHelpers/CalculateDaysFromBday";
import { formatDate } from "./ParentControllerHelpers/formatDate";
import fs from "fs";
import cloudinary from "../../../utils/cloudinary";

const prisma = new PrismaClient();

//TODO: add logic here or checkers
export const create = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infant: InfantInterface = req.body;

    // Check for duplicate infant record
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

//this function controls wether what is the vaccine medicine applicable for the infant base on its age
export const vaccine = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infant_id: string = req.body.infant_id;

    if (!infant_id === undefined) {
      throw new Error("Infant Id does not exist");
    }

    //find infant by its id
    const findInfant = await prisma.infant.findUnique({
      where: {
        id: infant_id,
      },
    });

    const bdayId = findInfant?.birthday_id;

    //find birthday
    const bday = await prisma.birthday.findUnique({
      where: {
        id: bdayId!,
      },
    });

    const birthday = `${bday?.year!}-${bday?.month!}-${bday?.day!}`; // Date format: YYYY-MM-DD
    const firstSchedDoseToDays = CalculateDayFromBday(birthday, 1, 15); //1 and a half month
    const secondSchedDoseToDays = CalculateDayFromBday(birthday, 2, 15); // 2 and a half month
    const thirdSchedDoseToDays = CalculateDayFromBday(birthday, 3, 15); //3 and a half month
    const fourthSchedDoseToDays = CalculateDayFromBday(birthday, 9, 0); //9 months
    const fifthSchedDoseToDays = CalculateDayFromBday(birthday, 12, 0); //1 year

    const applicableVaccines = await prisma.vaccination_Names.findMany({});

    const mapApplicableVaccines = applicableVaccines.map((vaccine) => ({
      id: vaccine.id,
      frequency: vaccine.frequency,
      once: vaccine.once,
      twice: vaccine.twice,
      thrice: vaccine.thrice,
    }));

    const birthDate1 = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    //TODO: Fix all the naming conventions here pang bobo yan e
    const oneMonthAndAHalf = new Date(
      birthDate1.setUTCDate(birthDate1.getUTCDate() + firstSchedDoseToDays)
    );

    const birthDate2 = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    //second dose date
    const twoMonthAndAHalf = new Date(
      birthDate2.setUTCDate(birthDate2.getUTCDate() + secondSchedDoseToDays)
    );

    const birthDate3 = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    //third dose date
    const thirdMonthAndAHalf = new Date(
      birthDate3.setUTCDate(birthDate3.getUTCDate() + thirdSchedDoseToDays)
    );

    const birthDate4 = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    const ninethMonth = new Date(
      birthDate4.setUTCDate(birthDate4.getUTCDate() + fourthSchedDoseToDays)
    );

    const birthDate5 = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    const tenthMonth = new Date(
      birthDate5.setUTCDate(birthDate5.getUTCDate() + fifthSchedDoseToDays)
    );

    //    const FormattedTenthMonth = tenthMonth.toLocaleDateString("en-US");

    const birthDateDose = new Date(
      Date.UTC(bday?.year!, bday?.month! - 1, bday?.day!)
    );

    //TODO:Double check the logic if the date are matching in the actual dates from the infant was born
    for (const vaccine of mapApplicableVaccines) {
      const existingSchedule = await prisma.vaccination_Schedule.findFirst({
        where: {
          vaccine_names: { some: { id: vaccine.id } },
          infant: { some: { id: infant_id } },
        },
      });

      if (existingSchedule) {
        throw new Error(`Schedule already exists for vaccine ${vaccine.id}`);
      }

      if (vaccine.once === "at birth") {
        await prisma.vaccination_Names.update({
          where: {
            id: vaccine.id,
          },
          data: {
            Vaccination_Schedule: {
              create: {
                firstDose: birthDateDose,
                infant: {
                  connect: {
                    id: infant_id,
                  },
                },
              },
            },
          },
        });
      }

      if (vaccine.frequency === 3) {
        await prisma.vaccination_Names.update({
          where: {
            id: vaccine.id,
          },
          data: {
            Vaccination_Schedule: {
              create: {
                firstDose: oneMonthAndAHalf,
                secondDose: twoMonthAndAHalf,
                thirdDose: thirdMonthAndAHalf,
                infant: {
                  connect: {
                    id: infant_id,
                  },
                },
              },
            },
          },
        });
      }

      if (
        vaccine.frequency === 2 &&
        vaccine.once === "3,15" &&
        vaccine.twice === "9,0"
      ) {
        await prisma.vaccination_Names.update({
          where: {
            id: vaccine.id,
          },
          data: {
            Vaccination_Schedule: {
              create: {
                firstDose: thirdMonthAndAHalf,
                secondDose: ninethMonth,
                infant: {
                  connect: {
                    id: infant_id,
                  },
                },
              },
            },
          },
        });
      }

      if (
        vaccine.frequency === 2 &&
        vaccine.once === "9,0" &&
        vaccine.twice === "12,0"
      ) {
        await prisma.vaccination_Names.update({
          where: {
            id: vaccine.id,
          },
          data: {
            Vaccination_Schedule: {
              create: {
                firstDose: ninethMonth,
                secondDose: tenthMonth,
                infant: {
                  connect: {
                    id: infant_id,
                  },
                },
              },
            },
          },
        });
      }
    }

    //TODO:Fix this data display
    successHandler(
      {
        message: "Vaccine Schedule created successfully...",
      },
      res,
      "POST"
    );
  }
);
//TODO: add here filter if firstDoseStatus is done dont show it
export const viewVaccineScheduleOfInfant = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parentId = req.parent?.id;
    const { infant_id } = req.params;

    const viewSchedule = await prisma.parent.findMany({
      where: { id: parentId },
      select: {
        Infant: {
          where: { id: infant_id },
          select: {
            id: true,
            fullname: true,
            birthday: {
              select: {
                month: true,
                day: true,
                year: true,
              },
            },
            Vaccination_Schedule: {
              where: { infant: { some: { id: infant_id } } },
              select: {
                id: true,
                vaccine_names: {
                  select: {
                    id: true,
                    vaccine_name: true,
                    frequency: true,
                    once: true,
                    twice: true,
                    thrice: true,
                  },
                },
                firstDose: true,
                secondDose: true,
                thirdDose: true,
              },
            },
          },
        },
      },
    });

    // Reorganize and format the data
    const formattedSchedule = viewSchedule.map((parent) => ({
      ...parent,
      Infant: parent.Infant.map((infant) => {
        // Flatten and organize doses
        const firstDose: any = [];
        const secondDose: any = [];
        const thirdDose: any = [];

        infant.Vaccination_Schedule.forEach((schedule) => {
          const vaccineDetails = schedule.vaccine_names.map((vaccine) => ({
            id: vaccine.id,
            name: vaccine.vaccine_name,
          }));

          if (schedule.firstDose) {
            firstDose.push({
              id: schedule.id,
              date: schedule.firstDose,
              vaccine_names: vaccineDetails,
            });
          }
          if (schedule.secondDose) {
            secondDose.push({
              id: schedule.id,
              date: schedule.secondDose,
              vaccine_names: vaccineDetails,
            });
          }
          if (schedule.thirdDose) {
            thirdDose.push({
              id: schedule.id,
              date: schedule.thirdDose,
              vaccine_names: vaccineDetails,
            });
          }
        });

        // Sort doses by date
        const sortByDate = (
          a: { date: string | Date },
          b: { date: string | Date }
        ): number => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        };

        return {
          id: infant.id,
          fullname: infant.fullname,
          birthday: infant.birthday,
          Vaccination_Schedule: {
            firstDose: firstDose.sort(sortByDate).map((dose: any) => ({
              id: dose.id,
              date: formatDate(new Date(dose.date)),
              vaccine_names: dose.vaccine_names,
            })),
            secondDose: secondDose.sort(sortByDate).map((dose: any) => ({
              id: dose.id,
              date: formatDate(new Date(dose.date)),
              vaccine_names: dose.vaccine_names,
            })),
            thirdDose: thirdDose.sort(sortByDate).map((dose: any) => ({
              id: dose.id,
              date: formatDate(new Date(dose.date)),
              vaccine_names: dose.vaccine_names,
            })),
          },
        };
      }),
    }));

    successHandler(formattedSchedule, res, "GET");
  }
);

export const viewVaccineScheduleOfAllInfant = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parentId = req.parent?.id;

    const viewSchedule = await prisma.parent.findMany({
      where: { id: parentId },
      include: {
        Infant: {
          include: {
            Vaccination_Schedule: {
              include: {
                vaccine_names: true,
                Vaccination: true,
              },
            },
          },
        },
      },
    });

    // Helper function to calculate time difference and filter "NOT_DONE" doses
    const parseDateAndFilterNotDone = (
      date: Date | null,
      dose: string,
      infantName: string,
      vaccineName: string
    ) => {
      if (!date) return null; // Skip null dates

      const dateStr = date.toISOString().split("T")[0]; // Convert Date to YYYY-MM-DD string
      const today = new Date();
      const difference = date.getTime() - today.getTime(); // Time difference in milliseconds

      if (difference > 0) {
        return {
          infantName,
          vaccineName,
          dose,
          date: dateStr, // Use the string version for display
          difference,
        };
      }
      return null;
    };

    // Collect all NOT_DONE doses with relevant details
    const allUpcomingVaccines: any[] = [];

    viewSchedule.forEach((parent) => {
      parent.Infant.forEach((infant) => {
        infant.Vaccination_Schedule.forEach((schedule) => {
          const vaccineName =
            schedule.vaccine_names[0]?.vaccine_name || "Unknown Vaccine";
          schedule.Vaccination.forEach((vaccination) => {
            if (vaccination.firstDoseStatus === "NOT_DONE") {
              const result = parseDateAndFilterNotDone(
                schedule.firstDose,
                "First Dose",
                infant.fullname,
                vaccineName
              );
              if (result) allUpcomingVaccines.push(result);
            }
            if (vaccination.secondDoseStatus === "NOT_DONE") {
              const result = parseDateAndFilterNotDone(
                schedule.secondDose,
                "Second Dose",
                infant.fullname,
                vaccineName
              );
              if (result) allUpcomingVaccines.push(result);
            }
            if (vaccination.thirdDoseStatus === "NOT_DONE") {
              const result = parseDateAndFilterNotDone(
                schedule.thirdDose,
                "Third Dose",
                infant.fullname,
                vaccineName
              );
              if (result) allUpcomingVaccines.push(result);
            }
          });
        });
      });
    });

    // Sort by the closest date
    const sortedVaccines = allUpcomingVaccines.sort(
      (a, b) => a.difference - b.difference
    );

    // Get the 3 closest dates
    const closestVaccines = sortedVaccines
      .slice(0, 3)
      .map(({ infantName, vaccineName, dose, date }) => ({
        infantName,
        vaccineName,
        dose,
        date,
      }));

    // Return the filtered data
    successHandler(closestVaccines, res, "GET");
  }
);

export const viewInfantInformation = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parentId = req.parent?.id;

    const viewInfant = await prisma.parent.findMany({
      where: { id: parentId },
      include: {
        address: true,
        Infant: {
          include: {
            birthday: true,
          },
        },
      },
    });

    successHandler(viewInfant, res, "GET");
  }
);

export const vaccinationNamesList = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { infant_id } = req.params;

    // Fetch vaccination names and their schedules
    const findVaccine = await prisma.vaccination_Names.findMany({
      include: {
        Vaccination_Schedule: {
          where: { infant: { some: { id: infant_id } } },
          include: {
            Vaccination: true,
          },
        },
      },
    });

    // Format the data and sort by vaccine_type_code numerically
    const formattedVaccineNames = findVaccine
      .map((vaccine) => ({
        ...vaccine,
        Vaccination_Schedule: vaccine.Vaccination_Schedule.map((schedule) => ({
          ...schedule,
          firstDose: schedule.firstDose
            ? formatDate(new Date(schedule.firstDose))
            : null,
          secondDose: schedule.secondDose
            ? formatDate(new Date(schedule.secondDose))
            : null,
          thirdDose: schedule.thirdDose
            ? formatDate(new Date(schedule.thirdDose))
            : null,
        })),
      }))
      .sort((a, b) => {
        // Extract numeric parts of vaccine_type_code for comparison
        const codeA = parseInt(a.vaccine_type_code, 10);
        const codeB = parseInt(b.vaccine_type_code, 10);
        return codeA - codeB; // Sort in ascending order
      });

    // Send the sorted and formatted response
    successHandler(formattedVaccineNames, res, "POST");
  }
);

export const getOneInfant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const checkId = await prisma.infant.findUnique({
      where: { id },
    });

    if (!checkId) {
      throw new Error("Infant not found");
    }

    const getOne = await prisma.infant.findUnique({
      where: {
        id: String(id),
      },
      include: {
        birthday: true,
      },
    });

    if (!getOne) {
      throw new Error(`Error Getting One Product`);
    }

    successHandler(getOne, res, "GET");
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

export const totalPercentage = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.parent?.id;

    const infantVaccination = await prisma.parent.findUnique({
      where: { id },
      select: {
        Infant: {
          select: {
            id: true,
            fullname: true,
            image: true,
            Vaccination_Schedule: {
              select: {
                vaccine_names: {
                  select: { vaccine_name: true, vaccine_type_code: true },
                },
                Vaccination: {
                  select: { percentage: true },
                },
              },
            },
          },
        },
      },
    });

    // Simplify and structure the output with total percentage
    const response = infantVaccination?.Infant.map((infant) => {
      const vaccinationSchedule = infant.Vaccination_Schedule.map(
        (schedule) => ({
          vaccineName: schedule.vaccine_names[0]?.vaccine_name,
          percentage: schedule.Vaccination[0]?.percentage || 0,
          sort: schedule.vaccine_names[0].vaccine_type_code,
        })
      );

      // Sort by the `sort` field (vaccine_type_code) in ascending order
      vaccinationSchedule.sort((a, b) => {
        const sortA = parseInt(a.sort, 10); // Convert string to number
        const sortB = parseInt(b.sort, 10); // Convert string to number
        return sortA - sortB; // Perform arithmetic comparison
      });

      // Calculate the average percentage as total percentage
      const totalPercentage =
        vaccinationSchedule.length > 0
          ? vaccinationSchedule.reduce(
              (sum, schedule) => sum + (schedule.percentage || 0),
              0
            ) / vaccinationSchedule.length
          : 0;

      return {
        id: infant.id,
        fullname: infant.fullname,
        image: infant.image,
        vaccinationSchedule,
        totalPercentage: parseFloat(totalPercentage.toFixed(2)), // Keep 2 decimal places
      };
    });

    successHandler({ infants: response }, res, "GET");
  }
);

export const progress = expressAsyncHandler(
  async (req: Request, res: Response) => {
    interface reqBody {
      infant_id: string;
    }
    const data: reqBody = req.body;

    // Fetch vaccination schedules for the infant
    const findVaccineSchedule = await prisma.vaccination_Schedule.findMany({
      where: { infant: { some: { id: data.infant_id } } },
      include: {
        Vaccination: true,
        vaccine_names: true, // Include the vaccine names to access frequency
      },
    });

    const nowDate = new Date();

    const calculateDateDifferences = (
      doseDates: (Date | null)[],
      doseType: string
    ) => {
      return doseDates
        .filter((doseDate) => doseDate !== null) // Exclude null dates
        .map((doseDate) => {
          const doseDateObj = new Date(doseDate!);
          const differenceInTime = doseDateObj.getTime() - nowDate.getTime();
          const differenceInDays = Math.ceil(
            differenceInTime / (1000 * 3600 * 24)
          );
          return { doseDate: doseDate!, differenceInDays, doseType };
        });
    };

    await Promise.all(
      findVaccineSchedule.map(async (schedule) => {
        const frequency = schedule.vaccine_names[0]?.frequency; // Assume one vaccine per schedule
        const firstDoseDifferences = calculateDateDifferences(
          [schedule.firstDose],
          "firstDose"
        );
        const secondDoseDifferences =
          frequency >= 2
            ? calculateDateDifferences([schedule.secondDose], "secondDose")
            : [];
        const thirdDoseDifferences =
          frequency === 3
            ? calculateDateDifferences([schedule.thirdDose], "thirdDose")
            : [];

        const vaccination = await prisma.vaccination.findFirst({
          where: { vaccination_Schedule_id: schedule.id },
        });

        let percentage = 0; // Default percentage value

        // Determine the percentage based on frequency and dose status
        if (frequency === 1) {
          percentage = 100;
        } else if (frequency === 2) {
          if (
            firstDoseDifferences.length > 0 &&
            firstDoseDifferences[0].differenceInDays <= 0
          ) {
            percentage = 50;
          }
          if (
            secondDoseDifferences.length > 0 &&
            secondDoseDifferences[0].differenceInDays <= 0
          ) {
            percentage = 100;
          }
        } else if (frequency === 3) {
          if (
            firstDoseDifferences.length > 0 &&
            firstDoseDifferences[0].differenceInDays <= 0
          ) {
            percentage = 33;
          }
          if (
            secondDoseDifferences.length > 0 &&
            secondDoseDifferences[0].differenceInDays <= 0
          ) {
            percentage = 66;
          }
          if (
            thirdDoseDifferences.length > 0 &&
            thirdDoseDifferences[0].differenceInDays <= 0
          ) {
            percentage = 100;
          }
        }

        // Update the percentage and status for doses
        // if (vaccination) {
        //   const updates: Partial<typeof vaccination> = {};

        //   // Update the status for doses
        //   for (const dose of [
        //     ...firstDoseDifferences,
        //     ...secondDoseDifferences,
        //     ...thirdDoseDifferences,
        //   ]) {
        //     const { doseType, differenceInDays } = dose;

        //     if (doseType === "firstDose") {
        //       updates.firstDoseStatus =
        //         differenceInDays > 0 ? "NOT_DONE" : "DONE";
        //     } else if (doseType === "secondDose") {
        //       updates.secondDoseStatus =
        //         differenceInDays > 0 ? "NOT_DONE" : "DONE";
        //     } else if (doseType === "thirdDose") {
        //       updates.thirdDoseStatus =
        //         differenceInDays > 0 ? "NOT_DONE" : "DONE";
        //     }
        //   }

        //   // Ensure the percentage is part of the update
        //   await prisma.vaccination.update({
        //     where: { id: vaccination.id },
        //     data: { ...updates, percentage },
        //   });
        // } else {
        //   await prisma.vaccination.create({
        //     data: {
        //       vaccination_Schedule_id: schedule.id,
        //       firstDoseStatus:
        //         firstDoseDifferences[0]?.differenceInDays > 0
        //           ? "NOT_DONE"
        //           : "DONE",
        //       secondDoseStatus:
        //         frequency >= 2
        //           ? secondDoseDifferences[0]?.differenceInDays > 0
        //             ? "NOT_DONE"
        //             : "DONE"
        //           : undefined,
        //       thirdDoseStatus:
        //         frequency === 3
        //           ? thirdDoseDifferences[0]?.differenceInDays > 0
        //             ? "NOT_DONE"
        //             : "DONE"
        //           : undefined,
        //       percentage,
        //     },
        //   });
        // }

        if (!vaccination) {
          await prisma.vaccination.create({
            data: {
              vaccination_Schedule_id: schedule.id,
              firstDoseStatus:
                firstDoseDifferences[0]?.differenceInDays > 0
                  ? "NOT_DONE"
                  : "DONE",
              secondDoseStatus:
                frequency >= 2
                  ? secondDoseDifferences[0]?.differenceInDays > 0
                    ? "NOT_DONE"
                    : "DONE"
                  : undefined,
              thirdDoseStatus:
                frequency === 3
                  ? thirdDoseDifferences[0]?.differenceInDays > 0
                    ? "NOT_DONE"
                    : "DONE"
                  : undefined,
              percentage,
            },
          });
        }
      })
    );

    successHandler(
      { message: "Vaccination records updated successfully." },
      res,
      "POST"
    );
  }
);

//TODO: Add checkers
export const updateExpoTokenNotification = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { expoPushToken } = req.body;
    const parentId = req.parent?.id;

    const findUser = await prisma.parent.update({
      where: {
        id: parentId,
      },
      data: {
        pushToken: expoPushToken,
      },
    });

    successHandler("Successfully updated push token notification", res, "POST");
  }
);
