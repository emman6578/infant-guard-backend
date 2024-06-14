import { Router } from "express";
import {
  getCurrentlyLoggedInDriver,
  getDeliveriesbyDriverLoggedin,
} from "../Controller/DriverDeliveryController/DriverDeliveryController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.get("/", driverAuthenticateToken, getCurrentlyLoggedInDriver);
router.get("/load", driverAuthenticateToken, getDeliveriesbyDriverLoggedin);

export default router;
