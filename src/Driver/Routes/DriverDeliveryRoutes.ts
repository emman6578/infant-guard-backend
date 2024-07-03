import { Router } from "express";
import {
  addToSales,
  getCurrentlyLoggedInDriver,
  getDeliveriesbyDriverLoggedin,
  listOfProductsforSale,
  updateDeliveriesbyDriverLoggedin,
} from "../Controller/DriverDeliveryController/DriverDeliveryController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";
import { update } from "../../Admin/Controller/PrintController/PrintController";

const router = Router();

router.get("/", driverAuthenticateToken, getCurrentlyLoggedInDriver);
router.get("/load", driverAuthenticateToken, getDeliveriesbyDriverLoggedin);
router.put(
  "/update/load",
  driverAuthenticateToken,
  updateDeliveriesbyDriverLoggedin
);
router.get("/products/forsale", driverAuthenticateToken, listOfProductsforSale);

router.post("/products/addtosale", driverAuthenticateToken, addToSales);

export default router;
