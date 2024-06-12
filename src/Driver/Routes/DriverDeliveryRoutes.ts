import { Router } from "express";
import { getCurrentlyLoggedInDriver } from "../Controller/DriverDeliveryController/DriverDeliveryController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.get("/", driverAuthenticateToken, getCurrentlyLoggedInDriver);

export default router;
