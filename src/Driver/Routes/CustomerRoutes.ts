import { Router } from "express";
import {
  createCustomer,
  getCustomers,
} from "../Controller/CustomerController/CustomerController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.post("/", driverAuthenticateToken, createCustomer);
router.get("/", driverAuthenticateToken, getCustomers);

export default router;
