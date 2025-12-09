import mongoose, { Schema } from "mongoose";

const DoctorSchema = new Schema(
  {
    name: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experienceInYears: {
      type: Number,
      default: 0,
    },
    worksInHospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
    ],
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    availability: [
      {
        day: String,
        time: String,
      },
    ],
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("doctor", DoctorSchema);
