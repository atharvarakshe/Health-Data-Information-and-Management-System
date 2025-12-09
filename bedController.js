import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {Bed} from "../models/bedModel.js";
import {Hospital} from "../models/hospitalModel.js";

// @desc     create new bed (role based)
// route     POST api/v1/beds/createBed
// @accesss  Private

const createBed = asyncHandler(async (req, res) => {
    const {bedNumber, room, isOccupied} = req.body;

    // validate user role
    const allowedRoles = ["Hospital"];
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to create a bed");
    }

    // validate required fields
    if (!bedNumber || !room || !isOccupied) {
      throw new ApiError(400, "All required fields must be provided");
    }

    // create the bed
    const bed = await Bed.create({
      bedNumber,
      room,
      isOccupied,
      patient: req.user._id,
      hospital: req.user.hospital,
    });

    // return the created bed
    return res
      .status(201)
      .json(new ApiResponse(201,bed, "Bed created successfully"));
})

// @desc     fetch all beds from db(role based)
// route     GET api/v1/beds/getAllBeds
// @accesss  Private

const getAllBeds = asyncHandler(async (req, res) => {
    // fetch the role of the requesting user
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      throw new ApiError(404, "Requesting user not found");
    }
    // fetch beds based on availability
    const beds = await Bed.find({
      isActive: true,
      isDeleted: false,
    });
    // Return the fetched beds
    res
      .status(200)
      .json(new ApiResponse(200, "Beds fetched successfully", beds));
})

// @desc     fetch a bed by Id from db
// route     GET api/v1/beds/{id}
// @accesss  Private
const getBedById = asyncHandler(async (req, res) => {
    const { bedId } = req.params;   
    const {hospitalId} = req.params;
    // validate bedId parameter
    if (!isValidObjectId(bedId)) {
      throw new ApiError(400, "Invalid bed ID");
    }

    // validate hospitalId parameter
    if (!isValidObjectId(hospitalId)) {
      throw new ApiError(400, "Invalid hospital ID");
    }  

    const bed = await Bed.findById(bedId);

    if (!bed) {
      throw new ApiError(404, "Bed not found");
    }

    // return the bed details
    return res
      .status(200)
      .json(new ApiResponse(200, bed, "Bed fetched successfully"));

})

// @desc     update bed by Id from db (role based)
// route     PATCH api/v1/beds/{id}
// @accesss  Private
const updateBed = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    const {bedNumber, room, isOccupied} = req.body;

if (!isValidObjectId(bedId)) {
  throw new ApiError(400, "Invalid bed ID");
}

// Prepare the update data
const updateData = {};
if (bedNumber) updateData.bedNumber = bedNumber;
if (room) updateData.room = room;
if (isOccupied) updateData.isOccupied = isOccupied;

// Update the bed
const updatedBed = await Bed.findByIdAndUpdate(bedId, updateData, {
  new: true,
});

// Check if the bed was found and updated
if (!updatedBed) {
  throw new ApiError(404, "Bed not found");
}

// Return the updated bed
return res
  .status(200)
  .json(new ApiResponse(200, updatedBed, "Bed updated successfully"));  

})

// @desc     delete bed by Id from db (role based)
// route     DELETE api/v1/beds/{id}
// @accesss  Private
const deleteBed = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    // validate bedId parameter
    if (!isValidObjectId(bedId)) {
      throw new ApiError(400, "Invalid bed ID");
    }

    // Delete the bed (soft delete)
    const bed = await Bed.findByIdAndUpdate(
      bedId,
      { isDeleted: true },
      { new: true }
    );

    if (!bed) {
      throw new ApiError(404, "Bed not found");
    }  

    //return success message
    return res
      .status(200)
      .json(new ApiResponse(200, "", "Bed deleted successfully"));

})

export {createBed, getAllBeds, getBedById, updateBed, deleteBed}