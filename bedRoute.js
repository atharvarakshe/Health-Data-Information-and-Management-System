import { Router } from "express";
import {
 createBed,
 getAllBeds,
 getBedById,
 updateBed,
 deleteBed
} from "../controllers/bedController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/createBed").post(createBed);
router.route("/getAllBeds").get(getAllBeds);

router.route("/:bedId").get(getBedById).patch(updateBed).delete(deleteBed);

export default router;
