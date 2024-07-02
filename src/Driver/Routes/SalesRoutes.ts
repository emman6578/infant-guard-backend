import { Router } from "express";
import {
  ConfirmSales,
  getLoggedInDriverSales,
  getSalesByDriver,
} from "../Controller/SalesController/SalesController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.get("/total", driverAuthenticateToken, getLoggedInDriverSales);
router.get("/driverSales", driverAuthenticateToken, getSalesByDriver);
router.post("/confirm", driverAuthenticateToken, ConfirmSales);

export default router;
