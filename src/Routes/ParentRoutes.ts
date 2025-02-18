import { Router } from "express";
import {
  create,
  vaccine,
  viewVaccineScheduleOfInfant,
  viewInfantInformation,
  vaccinationNamesList,
  progress,
  getOneInfant,
  uploadImgProfileInfant,
  totalPercentage,
  viewVaccineScheduleOfAllInfant,
  updateExpoTokenNotification,
  getParentInfo,
  uploadImgProfileParent,
  editInfant,
  editParent,
} from "../Controller/ParentController/ParentController";
import { authenticateToken } from "../Middleware/authMiddleware";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post("/", authenticateToken, create);
router.post("/vaccine", authenticateToken, vaccine);
router.get(
  "/schedule/:infant_id",
  authenticateToken,
  viewVaccineScheduleOfInfant
);
router.get("/schedule", authenticateToken, viewVaccineScheduleOfAllInfant);
router.get("/info", authenticateToken, viewInfantInformation);
router.get(
  "/vaccine-names/:infant_id",
  authenticateToken,
  vaccinationNamesList
);
router.post("/progress", authenticateToken, progress);

router.get("/infant-info/:id", authenticateToken, getOneInfant);

router.post(
  "/upload-img/:id",
  authenticateToken,
  upload.single("image"),
  uploadImgProfileInfant
);

router.post(
  "/upload-img-parent/:id",
  authenticateToken,
  upload.single("image"),
  uploadImgProfileParent
);

router.get("/percentage", authenticateToken, totalPercentage);

router.post("/pushToken", authenticateToken, updateExpoTokenNotification);

router.get("/parent-info", authenticateToken, getParentInfo);

router.put("/infant-update/:id", authenticateToken, editInfant);
router.put("/parent-update/:id", authenticateToken, editParent);

export default router;
