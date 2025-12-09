import { Router } from "express";
import {
 createHospital,
 getAllHospital,
 getHospitalById,
 updateHospital,
 deleteHospital
} from "../controllers/hospitalController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/createHospital").post(createHospital);
router.route("/getAllHospital").get(getAllHospital);

router.route("/:hospitalId").get(getHospitalById).patch(updateHospital).delete(deleteHospital);

export default router;
