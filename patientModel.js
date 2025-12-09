import mongoose, { Schema } from "mongoose";

const PatientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
      required: true,
    },
    allergies: [
      {
        type: String,
      },
    ],
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    emergencyContact: {
      type: String,
    },
    currentCondition: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["M", "F", "O"],
      required: true,
    },
    assignedDoctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("patient", PatientSchema);
