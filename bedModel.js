import mongoose, { Schema } from "mongoose";

const BedSchema = new Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    room: {
      type: String,
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  { timestamps: true }
);

export const Bed = mongoose.model("Bed", BedSchema);
