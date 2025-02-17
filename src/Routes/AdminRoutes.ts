import { Router } from "express";
import {
  deleteParent,
  parentList,
  updateParent,
} from "../Controller/AdminController/ParentManagement";
import { authenticateToken, isAdmin } from "../Middleware/authMiddleware";
import {
  adminDashboard,
  totalPercentage,
} from "../Controller/AdminController/HomeController";
import {
  createInfant,
  deleteInfants,
  editInfants,
  findExpoPushToken,
  infantLists,
  infantOne,
  updateVaccinationDate,
  updateVaccinationStatus,
  uploadImgProfileInfant,
} from "../Controller/AdminController/InfantManagement";
import multer from "multer";
import {
  download,
  InfantDataToDownload,
  listOfFileInPdf,
  uploadPdfInfant,
} from "../Controller/AdminController/DownloadDataController";

const upload = multer({ dest: "uploads/" });

const router = Router();

//Home Routes
router.get("/percentage", authenticateToken, isAdmin, totalPercentage);
router.get("/home-admin", authenticateToken, isAdmin, adminDashboard);

//Parent Routes
router.get("/parents", authenticateToken, isAdmin, parentList);
router.delete("/delete/:id", authenticateToken, isAdmin, deleteParent);
router.put("/update/:id", authenticateToken, isAdmin, updateParent);

//Infant Routes
router.get("/infants", authenticateToken, isAdmin, infantLists);
router.post("/create", authenticateToken, isAdmin, createInfant);
router.post(
  "/upload-img/:id",
  authenticateToken,
  upload.single("image"),
  uploadImgProfileInfant
);
router.delete("/infants-delete", authenticateToken, isAdmin, deleteInfants);
router.put("/infant-update/:id", authenticateToken, isAdmin, editInfants);
router.get("/infant/:id", authenticateToken, isAdmin, infantOne);
router.put("/update-progress", authenticateToken, updateVaccinationStatus);
router.post("/notify/:infant_id", authenticateToken, findExpoPushToken);
router.put(
  "/update-vaccine-schedule-date",
  authenticateToken,
  updateVaccinationDate
);

//Download Data Routes
router.get("/infant-data", authenticateToken, isAdmin, InfantDataToDownload);
router.post(
  "/upload-pdf/:id",
  authenticateToken,
  upload.single("pdf"),
  uploadPdfInfant
);
router.get("/file", authenticateToken, listOfFileInPdf);
router.get("/download/:filename", download);

export default router;
