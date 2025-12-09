import mongoose, { Schema } from "mongoose";

const HospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    specializedIn: [
      {
        type: String,
      },
    ],
    contactNumber: {
      type: String,
    },
    facilities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Facility",
      },
    ],
    doctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    beds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bed",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      set: (value) => value,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      set: (value) => value,
    },
  },

  { timestamps: true }
);

export const Hospital = mongoose.model("hospital", HospitalSchema);
