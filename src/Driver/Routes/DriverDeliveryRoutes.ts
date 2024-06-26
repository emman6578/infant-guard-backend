import { Router } from "express";
import {
  addToSales,
  getCurrentlyLoggedInDriver,
  getDeliveriesbyDriverLoggedin,
  listOfProductsforSale,
} from "../Controller/DriverDeliveryController/DriverDeliveryController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.get("/", driverAuthenticateToken, getCurrentlyLoggedInDriver);
router.get("/load", driverAuthenticateToken, getDeliveriesbyDriverLoggedin);
router.get("/products/forsale", driverAuthenticateToken, listOfProductsforSale);

router.post("/products/addtosale", driverAuthenticateToken, addToSales);

export default router;
