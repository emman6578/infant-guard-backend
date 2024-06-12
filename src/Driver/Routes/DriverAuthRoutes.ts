import { Router } from "express";
import {
  driverLogin,
  driverRegister,
  driverAuthenticate,
} from "../Controller/DriverAuthController/AuthController";

const router = Router();

router.post("/register", driverRegister);
router.post("/login", driverLogin);
router.post("/authenticate", driverAuthenticate);

export default router;
