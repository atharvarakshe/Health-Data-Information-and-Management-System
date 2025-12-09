import mongoose, { Schema } from "mongoose";

const HealthDataSchema = new mongoose.Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  dateOfReport: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

export const HealthData = mongoose.model("HealthData", HealthDataSchema);
