import mongoose, { isValidObjectId } from "mongoose";

// import utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// import model(s)
import { User } from "../models/userModel.js";
import { Patient } from "../models/patientModel.js";
import { Doctor } from "../models/doctorModel.js";

// @desc     create new doctor (role based)
// route     POST api/v1/doctor/createDoctor
// @accesss  Private
const createDoctor = asyncHandler(async (req, res) => {
  const {
    userId,
    salary,
    qualification,
    experienceInYears,
    worksInHospitals,
    gender,
    availability,
  } = req.body;

  // validate user role
  const allowedRoles = ["Hospital"];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "You are not authorized to create a doctor");
  }

  // validate required fields
  if (
    !salary ||
    !qualification ||
    !experienceInYears ||
    !worksInHospitals ||
    !gender ||
    !availability
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // create the doctor
  const doctor = await Doctor.create({
    userId,
    salary,
    qualification,
    experienceInYears,
    worksInHospitals,
    gender,
    availability,
  });

  // respond with the created doctor
  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor created successfully"));
});

// @desc     fetch all doctor from db (role based fetching)
// route     GET api/v1/docotrs/getAllDoctor
// @accesss  Private
const getAllDoctor = asyncHandler(async (req, res) => {
  // fetch the role of the requesting user
  const requestingUser = await User.findById(req.user._id);
  if (!requestingUser) {
    throw new ApiError(404, "Requesting user not found");
  }

  let roleFilter = {};

  if (requestingUser.role === "Patient") {
    throw new ApiError(401, "Unauthorized to access the resource");
  }
  // Fetch users based on the role filter, active status, and non-deleted status
  const users = await Doctor.find({
    ...roleFilter,
    isActive: true,
    isDeleted: false,
  });
  // Return the fetched users
  res
    .status(200)
    .json(new ApiResponse(200, "Doctor fetched successfully", users));
});

// @desc     fetch a doctor by Id from db
// route     GET api/v1/doctors/{id}
// @accesss  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  // validate doctorId parameter
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  const doctor = await Doctor.findById(req.params.id).populate("user");

  //check if the doctor was found
  if (!doctor) {
    throw new ApiError(404, "doctor not found");
  }

  // return the user details
  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor fetched successfully"));
});

// @desc     update doctor by Id from db (role based)
// route     PATCH api/v1/doctors/{id}
// @accesss  Private
const updateDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const {
    salary,
    qualification,
    experienceInYears,
    worksInHospitals,
    gender,
    availability,
  } = req.body;

  // validate doctor
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  // Prepare the update object
  const updateData = {};
  if (salary) updateData.salary = salary;
  if (qualification) updateData.qualification = qualification;
  if (experienceInYears) updateData.experienceInYears = experienceInYears;
  if (worksInHospitals) updateData.worksInHospitals = worksInHospitals;
  if (gender) updateData.gender = gender;
  if (availability) updateData.availability = availability;

  // update user
  const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
    new: true,
  });

  // check if doctor was found and update
  if (!updateDoctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // return the updated doctor details
  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "Doctor updated successfully"));
});

// @desc     delete doctor by Id from db (soft-delete & role based)
// route     POST api/v1/doctor/{id}
// @accesss  Private
const deleteDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  // validate the doctorId
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  // Delete the doctor (soft delete)
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { isDeleted: true },
    { new: true }
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  //return success message
  return res
    .status(200)
    .json(new ApiResponse(200, "", "Doctor deleted successfully"));
});

export {
  createDoctor,
  getAllDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
