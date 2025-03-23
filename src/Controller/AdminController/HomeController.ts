import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { successHandler } from "../../Middleware/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

// export const totalPercentage = expressAsyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const infants = await prisma.infant.findMany({
//       include: {
//         // Include the address relation
//         address: true,
//         Vaccination_Schedule: {
//           include: { vaccine_names: true, Vaccination: true },
//         },
//       },
//     });

//     const simplifiedInfants = infants.map((infant) => ({
//       id: infant.id,
//       fullname: infant.fullname,
//       image: infant.image,
//       // Add the infant's address and gender to the result
//       address: infant.address,
//       gender: infant.gender,
//       vaccinationSched: infant.Vaccination_Schedule.map((schedule) => ({
//         vaccineName: schedule.vaccine_names[0]?.vaccine_name,
//         percentage: schedule.Vaccination[0]?.percentage,
//         sort: schedule.vaccine_names[0]?.vaccine_type_code,
//       })),
//     }));

//     simplifiedInfants.forEach((infant) => {
//       infant.vaccinationSched.sort((a, b) => {
//         const sortA = parseInt(a.sort, 10); // Convert string to number
//         const sortB = parseInt(b.sort, 10); // Convert string to number
//         return sortA - sortB;
//       });
//     });

//     successHandler(simplifiedInfants, res, "GET");
//   }
// );

export const totalPercentage = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const infants = await prisma.infant.findMany({
      include: {
        address: true,
        Vaccination_Schedule: {
          include: { vaccine_names: true, Vaccination: true },
        },
      },
    });

    const simplifiedInfants = infants.map((infant) => ({
      id: infant.id,
      fullname: infant.fullname,
      image: infant.image,
      // Add the infant's address and gender to the result
      address: infant.address,
      gender: infant.gender,
      vaccinationSched: infant.Vaccination_Schedule.map((schedule) => {
        const frequency = schedule.vaccine_names[0]?.frequency; // Already a number
        let updatedDoseCount = 0;
        if (schedule.UpdateFirstDose) updatedDoseCount++;
        if (frequency > 1 && schedule.UpdateSecondDose) updatedDoseCount++;
        if (frequency > 2 && schedule.UpdateThirdDose) updatedDoseCount++;
        const percentage = Math.round((updatedDoseCount / frequency) * 100);
        return {
          vaccineName: schedule.vaccine_names[0]?.vaccine_name,
          percentage: percentage,
          sort: schedule.vaccine_names[0]?.vaccine_type_code,
        };
      }),
    }));

    simplifiedInfants.forEach((infant) => {
      infant.vaccinationSched.sort((a, b) => {
        const sortA = parseInt(a.sort, 10); // Convert string to number
        const sortB = parseInt(b.sort, 10); // Convert string to number
        return sortA - sortB;
      });
    });
    successHandler(simplifiedInfants, res, "GET");
  }
);
export const adminDashboard = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 1. Fetch infant records with their vaccination schedules and address
    const infantsPromise = prisma.infant.findMany({
      include: {
        // Include the address relation
        address: true,
        Vaccination_Schedule: {
          include: { vaccine_names: true, Vaccination: true },
        },
      },
    });

    // 2. Fetch recent parent registrations (or logins) (limit to 5 for the dashboard)
    // Only include parents with the role "Parent"
    const recentParentsPromise = prisma.parent.findMany({
      where: {
        role: "Parent",
      },
      orderBy: { created: "desc" },
      take: 5,
      select: {
        id: true,
        fullname: true,
        created: true,
        lastLogin: true,
        role: true,
      },
    });

    // 3. Fetch overall counts for parents, infants, and vaccinations
    // Only count parents with the role "Parent"
    const totalParentsPromise = prisma.parent.count({
      where: {
        role: "Parent",
      },
    });
    const totalInfantsPromise = prisma.infant.count();
    const totalVaccinationsPromise = prisma.vaccination.count();

    // 4. Fetch all vaccination records to compute a status summary
    const vaccinationsPromise = prisma.vaccination.findMany();

    // 5. Fetch the latest notifications (limit to 5) and include the parent's fullname
    const notificationsPromise = prisma.notification.findMany({
      orderBy: { created: "desc" },
      take: 5,
      include: {
        parent: {
          select: { fullname: true },
        },
      },
    });

    // Execute all queries concurrently
    const [
      infants,
      recentParents,
      totalParents,
      totalInfants,
      totalVaccinations,
      vaccinations,
      notifications,
    ] = await Promise.all([
      infantsPromise,
      recentParentsPromise,
      totalParentsPromise,
      totalInfantsPromise,
      totalVaccinationsPromise,
      vaccinationsPromise,
      notificationsPromise,
    ]);

    // Process and simplify infant data for the response
    const simplifiedInfants = infants.map((infant) => ({
      id: infant.id,
      fullname: infant.fullname,
      image: infant.image,
      // Add the infant's address and gender to the result
      address: infant.address,
      gender: infant.gender,
      vaccinationSched: infant.Vaccination_Schedule.map((schedule) => ({
        vaccineName: schedule.vaccine_names[0]?.vaccine_name,
        percentage: schedule.Vaccination[0]?.percentage,
        sort: schedule.vaccine_names[0]?.vaccine_type_code,
      })),
    }));

    // Sort each infant's vaccination schedule by the sort key (converted to number)
    simplifiedInfants.forEach((infant) => {
      infant.vaccinationSched.sort((a, b) => {
        const sortA = parseInt(a.sort, 10) || 0;
        const sortB = parseInt(b.sort, 10) || 0;
        return sortA - sortB;
      });
    });

    // Build a summary of vaccination statuses across all vaccination records
    const vaccinationStatusCounts = {
      firstDose: { DONE: 0, ONGOING: 0, NOT_DONE: 0 },
      secondDose: { DONE: 0, ONGOING: 0, NOT_DONE: 0 },
      thirdDose: { DONE: 0, ONGOING: 0, NOT_DONE: 0 },
    };

    vaccinations.forEach((vac) => {
      if (vac.firstDoseStatus) {
        vaccinationStatusCounts.firstDose[vac.firstDoseStatus] =
          (vaccinationStatusCounts.firstDose[vac.firstDoseStatus] || 0) + 1;
      }
      if (vac.secondDoseStatus) {
        vaccinationStatusCounts.secondDose[vac.secondDoseStatus] =
          (vaccinationStatusCounts.secondDose[vac.secondDoseStatus] || 0) + 1;
      }
      if (vac.thirdDoseStatus) {
        vaccinationStatusCounts.thirdDose[vac.thirdDoseStatus] =
          (vaccinationStatusCounts.thirdDose[vac.thirdDoseStatus] || 0) + 1;
      }
    });

    // Compose the custom JSON response for the admin dashboard
    const responseData = {
      overview: {
        totalParents,
        totalInfants,
        totalVaccinations,
      },
      recentParents, // Recent parent registrations or logins
      infants: simplifiedInfants, // Detailed infant vaccination data including address and gender
      vaccinationSummary: vaccinationStatusCounts, // Vaccination status summary
      notifications, // Latest notifications with parent's name included
      message: "Dashboard data fetched successfully",
    };

    res.status(200).json(responseData);
  }
);
