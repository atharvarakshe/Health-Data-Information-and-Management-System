import { Router } from "express";
import {
 createDoctor,
 getAllDoctor,
 getDoctorById,
 updateDoctor,
 deleteDoctor,
} from "../controllers/doctorController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/createDoctor").post(createDoctor);
router.route("/getAllDoctor").get(getAllDoctor);

router.route("/:doctorId").get(getDoctorById).patch(updateDoctor).delete(deleteDoctor);

export default router;
