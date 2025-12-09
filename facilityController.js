import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Facility } from "../models/facilityModel.js";
import { User } from "../models/userModel.js";

// @desc     create new facility (role based)
// route     POST api/v1/facilities/createFacility
// @accesss  Private
const createFacility = asyncHandler(async (req, res) => {
  const { name, address, type } = req.body;

  // validate user role
  const allowedRoles = [0, 1];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Unauthorized to access this resource",
    });
  }

  // validate required fields
  if (
    !name ||
    !address ||
    !address.state ||
    !address.city ||
    !address.pincode ||
    typeof type === "undefined"
  ) {
    return res.status(403).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Create the facility
  const facilities = await Facility.create({
    name,
    address,
    type,
  });

  // Respond with the created facility
  return res
    .status(201)
    .json(new ApiResponse(201, facilities, "Facility created successfully"));
});

// @desc     fetch all facility from db (role based fetching)
// route     GET api/v1/facilities/getAllFacility
// @accesss  Private
const getAllFacility = asyncHandler(async (req, res) => {
  try {
    // fetch the role of the requesting user
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found",
      });
    }

    // Check if the user's role is allowed (0 or 1)
    const { role } = requestingUser;
    if (![0, 1].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to access this resource",
      });
    }

    // Fetch users based on the role filter, active status, and non-deleted status
    const facilities = await Facility.find({
      isActive: true,
      isDeleted: false,
    });
    // Return the fetched users
    return res.status(200).json({
      success: true,
      message: "Facilities fetched successfully",
      data: facilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching facilities",
    });
  }
});

// @desc     fetch a facility by Id from db
// route     GET api/v1/facilities/{id}
// @accesss  Private
const getFacilityById = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;

  // validate facilityId parameter
  if (!isValidObjectId(facilityId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  // find the facility by ID
  const facilities = await Facility.findById(facilityId);

  //check if the facility was found
  if (!facilities) {
    return res.status(404).json({
      success: false,
      message: "Requesting facility not found",
    });
  }

  // return the user details
  return res
    .status(200)
    .json(new ApiResponse(200, facilities, "Facility fetched successfully"));
});

// @desc     update facility by Id from db (role based)
// route     PATCH api/v1/facilities/{id}
// @accesss  Private
const updateFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const { name, address, type } = req.body;

  // validate facility
  if (!isValidObjectId(facilityId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid facility ID",
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

    // Retrieve the existing facility
    const existingFacility = await Facility.findById(facilityId);
    if (!existingFacility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    // Prepare the update object
    const updateData = {};

    if (name) updateData.name = name;

    // Update the address if all fields are present
    if (address) {
      updateData.address = {
        state: address.state || existingFacility.address.state,
        city: address.city || existingFacility.address.city,
        pincode: address.pincode || existingFacility.address.pincode,
      };
    }

    // Update the type if provided
    if (type !== undefined) updateData.type = type;

    // update user
    const updatedFacility = await Facility.findByIdAndUpdate(
      facilityId,
      updateData,
      {
        new: true,
      }
    );

    // check if facility was found and update
    if (!updatedFacility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    // return the updated facility details
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedFacility, "Facility updated successfully")
      );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the facility",
    });
  }
});

// @desc     delete facility by Id from db (soft-delete & role based)
// route     POST api/v1/facilities/{id}
// @accesss  Private
const deleteFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;

  // validate the facilityId
  if (!isValidObjectId(facilityId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
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
        message: "Access denied: Unauthorized to delete this user",
      });
    }
    // Delete the facility (soft delete)
    const facilities = await Facility.findByIdAndUpdate(
      facilityId,
      { isDeleted: true },
      { new: true }
    );
    if (!facilities) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    //return success message
    return res
      .status(200)
      .json(new ApiResponse(200, "", "Facility deleted successfully"));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the facility",
    });
  }
});

export {
  createFacility,
  getAllFacility,
  getFacilityById,
  updateFacility,
  deleteFacility,
};
