import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes import
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import facilityRouter from "./routes/facilityRoute.js";
import patientRouter from "./routes/patientRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import bedRouter from "./routes/bedRoute.js";
import hospitalRouter from "./routes/hospitalRoute.js";

// routes declaration
app.use("/api/v1/auths", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/facilities", facilityRouter);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/beds", bedRouter);
app.use("/api/v1/hospitals", hospitalRouter);


export { app };
