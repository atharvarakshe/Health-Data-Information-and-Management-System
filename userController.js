import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/userModel.js";

// @desc     fetch all user from db (role based fetching)
// route     GET api/v1/users/getAllUsers
// @accesss  Private

const getAllUsers = asyncHandler(async (req, res) => {
  try {
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

    // Fetch users only if authorized
    const users = await User.find({
      isActive: true,
      isDeleted: false,
    }).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
    });
  }
});

// @desc     fetch a user by Id from db
// route     GET api/v1/users/{id}
// @accesss  Private
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId parameter
  if (!isValidObjectId(userId)) {
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

    // Check if the user's role is allowed (0 or 1)
    const { role } = requestingUser;
    if (![0, 1].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized to access this resource",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId).select("-password -refreshToken");

    // Check if the user was found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check `isActive` and `isDeleted` conditions
    if ((!user.isActive || user.isDeleted) && role !== 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied: User is inactive or deleted",
      });
    }

    // Return the user details
    return res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user",
    });
  }
});

// @desc     update user by Id from db
// route     PATCH api/v1/users/{id}
// @accesss  Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullName, email, mobileNumber, role, isActive, isDeleted } = req.body;

  // Validate userId parameter
  if (!isValidObjectId(userId)) {
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
        message: "Access denied: Unauthorized to update this user",
      });
    }

    // Prepare the update object
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDeleted !== undefined) updateData.isDeleted = isDeleted;

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the updated user details
    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user",
    });
  }
});

// @desc     delete user by Id from db (soft-delete)
// route     POST api/v1/users/{id}
// @accesss  Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the userId parameter
  if (!isValidObjectId(userId)) {
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

    // Perform a soft delete (update isDeleted field to true)
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    // Check if the user was found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return a success message
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user",
    });
  }
});

export { getAllUsers, getUserById, updateUser, deleteUser };
