import { Router } from "express";
import { getAllDriverSales } from "../Controller/SalesController/SalesController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.get("/", driverAuthenticateToken, getAllDriverSales);

export default router;
