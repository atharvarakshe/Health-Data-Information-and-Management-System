import mongoose, { isValidObjectId } from "mongoose";

// import utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// import model(s)
import { User } from "../models/userModel.js";
import { Patient } from "../models/patientModel.js";
import { Doctor } from "../models/doctorModel.js";

// @desc     create new patient (role based)
// route     POST api/v1/patients/createPatient
// @accesss  Private
const createPatient = asyncHandler(async (req, res) => {
  const {
    userId,
    age,
    bloodGroup,
    medicalHistory,
    allergies,
    hospitalId,
    emergencyContact,
    currentCondition,
    gender,
    assignedDoctor,
  } = req.body;

  // validate user role
  const allowedRoles = [1];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Unauthorized to access this resource",
    });
  }

  // validate required fields
  if (
    !age ||
    !bloodGroup ||
    !medicalHistory ||
    !allergies ||
    !emergencyContact ||
    !currentCondition ||
    !gender
  ) {
    return res.status(403).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (age <= 0) {
    return res.status(400).json({
      success: false,
      message: "Age must be a positive number.",
    });
  }

  // create the patient
  const patient = await Patient.create({
    userId,
    age,
    bloodGroup,
    medicalHistory,
    allergies,
    hospitalId,
    emergencyContact,
    currentCondition,
    gender,
    assignedDoctor,
  });

  // respond with the created patient
  return res
    .status(201)
    .json(new ApiResponse(201, patient, "Patient created successfully"));
});

// @desc     fetch all patient from db (role based fetching)
// route     GET api/v1/patients/getAllPatient
// @accesss  Private
const getAllPatient = asyncHandler(async (req, res) => {
  try {
    // fetch the role of the requesting user
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found",
      });
    }
    const { role } = requestingUser;
    if (![0, 1].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to access this resource",
      });
    }
    // Fetch users based on the role filter, active status, and non-deleted status
    const patient = await Patient.find({});
    // Return the fetched users
    return res
      .status(200)
      .json(new ApiResponse(200, "Patients fetched successfully", patient));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching patients",
    });
  }
});

// @desc     fetch a patient by Id from db
// route     GET api/v1/patients/{id}
// @accesss  Private
const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // validate patientId parameter
  if (!isValidObjectId(patientId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid patient ID",
    });
  }

  const patient = await Patient.findById(patientId)
    .populate({
      path: "userId",
      select: "-password -refreshToken -isActive -isDeleted -role",
    })
    .populate("assignedDoctor");

  //check if the patient was found
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Requesting patient not found",
    });
  }

  // return the user details
  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient fetched successfully"));
});

// @desc     update patient by Id from db (role based)
// route     PATCH api/v1/patients/{id}
// @accesss  Private
const updatePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const {
    age,
    bloodGroup,
    medicalHistory,
    allergies,
    hospitalId,
    emergencyContact,
    currentCondition,
    gender,
    assignedDoctor,
  } = req.body;

  // validate patient
  if (!isValidObjectId(patientId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid patient ID",
    });
  }

  try {
    // Get the requesting user's details
    const requestingUser = await User.findById(req.user._id);

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found",
      });
    }

    // Check if the requesting user has role 0 (Admin) or 1
    if (![0, 1].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to update this user",
      });
    }

    // Retrieve the existing patient
    const existingPatient = await Patient.findById(patientId);
    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Prepare the update object
    const updateData = {};
    if (age) updateData.age = age;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (medicalHistory) updateData.medicalHistory = medicalHistory;
    if (allergies) updateData.allergies = allergies;
    if (hospitalId) updateData.hospitalId = hospitalId;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (currentCondition) updateData.currentCondition = currentCondition;
    if (gender) updateData.gender = gender;
    if (assignedDoctor) updateData.assignedDoctor = assignedDoctor;

    // update user
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      {
        new: true,
      }
    );

    // check if patient was found and update
    if (!updatePatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // return the updated patient details
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPatient, "Patient updated successfully")
      );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the patient",
    });
  }
});

// @desc     delete patient by Id from db (soft-delete & role based)
// route     POST api/v1/patient/{id}
// @accesss  Private
const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  // validate the patientId
  if (!isValidObjectId(patientId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const requestingUser = await User.findById(req.user._id);

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found",
      });
    }

    if (![0, 1].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to delete this user",
      });
    }

    // Delete the patient (soft delete)
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { isDeleted: true },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    //return success message
    return res
      .status(200)
      .json(new ApiResponse(200, "", "patient deleted successfully"));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the patient",
    });
  }
});

export {
  createPatient,
  getAllPatient,
  getPatientById,
  updatePatient,
  deletePatient,
};
