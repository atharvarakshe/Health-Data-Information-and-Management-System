import mongoose, { isValidObjectId } from "mongoose";

// import utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// import model(s)
import { Hospital } from "../models/hospitalModel.js";
import { User } from "../models/userModel.js";
import { Bed } from "../models/bedModel.js";
import { Facility } from "../models/facilityModel.js";

// @desc     create new hospital (role based)
// route     POST api/v1/hospitals/createHospital
// @accesss  Private
const createHospital = asyncHandler(async (req, res) => {
  const { name, address, specializedIn, contactNumber } = req.body;

  //validate user role
  const allowedRoles = [0];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Unauthorized to access this resource",
    });
  }

  // validate required fields
  if (
    !name ||
    !address?.state ||
    !address?.city ||
    !address?.pincode ||
    !specializedIn ||
    !contactNumber
  ) {
    return res.status(403).json({
      success: false,
      message: "All fields are required",
    });
  }

  // create the hospital
  const hospital = await Hospital.create({
    name,
    address,
    specializedIn,
    contactNumber,
  });
  // respond with the created hospital
  return res
    .status(201)
    .json(new ApiResponse(201, hospital, "Hospital created successfully"));
});

// @desc     fetch all hospital from db (role based fetching)
// route     GET api/v1/hospitals/getAllHospital
// @accesss  Private

const getAllHospital = asyncHandler(async (req, res) => {
  // fetch the role of the requesting user
  try {
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found",
      });
    }

    // Fetch users based on the role filter, active status, and non-deleted status
    const hospitals = await Hospital.find({
      isActive: true,
      isDeleted: false,
    });
    // Return the fetched hospitals
    return res.status(200).json({
      success: true,
      message: "Hospitals fetched successfully",
      data: hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching hospitals",
    });
  }
});

// @desc     fetch a hospital by Id from db
// route     GET api/v1/hospitals/{id}
// @accesss  Private
const getHospitalById = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;

  // validate hospitalId parameter
  if (!isValidObjectId(hospitalId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const hospital = await Hospital.findById(hospitalId);
  //check if the hospital was found
  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: "Requesting hospital not found",
    });
  }

  // return the hospital details
  return res
    .status(200)
    .json(new ApiResponse(200, hospital, "Facility fetched successfully"));
});

// @desc     update hospital by Id from db (role based)
// route     PATCH api/v1/hospitals/{id}
// @accesss  Private
const updateHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const { name, address, specializedIn, contactNumber } = req.body;

  // validate hospital
  if (!isValidObjectId(hospitalId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid hospital ID",
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
    // Check if the requesting user has role 0 (Admin)
    if (![0].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to update this hospital",
      });
    }
    // Retrieve the existing facility
    const existingHospital = await Hospital.findById(hospitalId);
    if (!existingHospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    // Prepare the update object
    const updateData = {};
    if (name) updateData.name = name;
    if (address) {
      updateData.address = {
        state: address.state || existingHospital.address.state,
        city: address.city || existingHospital.address.city,
        pincode: address.pincode || existingHospital.address.pincode,
      };
    }
    if (specializedIn) updateData.specializedIn = specializedIn;
    if (contactNumber) updateData.contactNumber = contactNumber;

    // update user
    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updateData,
      {
        new: true,
      }
    );

    // check if hospital was found and update
    if (!updatedHospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // return the updated hospital details
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedFacility, "Facility updated successfully")
      );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the hospital",
    });
  }
});

// @desc     delete hospital by Id from db (soft-delete & role based)
// route     POST api/v1/hospitals/{id}
// @accesss  Private
const deleteHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;

  // validate the hospitalId
  if (!isValidObjectId(hospitalId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid hospital ID",
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

    // Check if the requesting user has role 0 (Admin)
    if (![0].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to delete this user",
      });
    }
    // Delete the hospital (soft delete)
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { isDeleted: true },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    //return success message
    return res
      .status(200)
      .json(new ApiResponse(200, "", "Hospital deleted successfully"));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the hospital",
    });
  }
});

export {
  createHospital,
  getAllHospital,
  getHospitalById,
  updateHospital,
  deleteHospital,
};
