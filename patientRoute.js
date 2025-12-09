import { Router } from "express";
import {
  createPatient,
  deletePatient,
  getAllPatient,
  getPatientById,
  updatePatient,
} from "../controllers/patientController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/createPatient").post(createPatient);
router.route("/getAllPatient").get(getAllPatient);

router
  .route("/:patientId")
  .get(getPatientById)
  .patch(updatePatient)
  .delete(deletePatient);

export default router;
