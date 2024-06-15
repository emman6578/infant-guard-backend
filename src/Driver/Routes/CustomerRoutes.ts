import { Router } from "express";
import { createCustomer } from "../Controller/CustomerController/CustomerController";
import { driverAuthenticateToken } from "../Middleware/DriverAuthMiddleware";

const router = Router();

router.post("/", driverAuthenticateToken, createCustomer);

export default router;
