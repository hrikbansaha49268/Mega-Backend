import { User } from '../models/user.model.js';
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import generateAccessAndRefreshToken from '../utils/tokenGenerator.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: true
};

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, username, password, email } = req.body;

    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    } else {
        if (await User.exists({ $or: [{ username }, { email }] })) {
            throw new ApiError(409, "User exists already");
        } else {
            const avatarLocalPath = req.files?.avatar[0]?.path;
            if (!avatarLocalPath) {
                throw new ApiError(409, "Avatar is required");
            } else {
                const avatarUrl = await uploadOnCloudinary(avatarLocalPath);

                let coverImageLocalPath;
                if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                    coverImageLocalPath = req.files.coverImage[0].path;
                }
                const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
                if (!avatarUrl) {
                    throw new ApiError(409, "Avatar is required");
                } else {
                    const user = await User.create({
                        fullName,
                        avatar: avatarUrl,
                        coverImage: coverImageUrl || "",
                        email,
                        password,
                        username: username.toLowerCase()
                    });
                    user.save();
                    const createdUser = await User.findById(user._id).select("-password -refreshToken");
                    if (!createdUser) {
                        throw new ApiError(500, "Something went wrong while registering the user");
                    } else {
                        return res.status(201).json(new ApiResponse(201, createdUser, "User registered Succesfully"));
                    };
                };
            };
        };
    };
});

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required");
    } else {
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw new ApiError(400, "Account is not registered. Please signup");
        } else {
            const isPassCorrect = await user.isPasswordCorrect(password);
            if (isPassCorrect) {
                throw new ApiError(401, "Please enter a valid password");
            } else {
                const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

                const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

                return res.status(200)
                    .cookie("accessToken", accessToken, cookieOptions)
                    .cookie("refreshToken", refreshToken, cookieOptions)
                    .json(new ApiResponse(
                        200,
                        {
                            user: loggedInUser,
                            accessToken, refreshToken
                        },
                        "User logged in successfully"
                    ));
            };
        };
    };
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );
    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    } else {
        try {
            const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedRefreshToken?._id);
            if (!user) {
                throw new ApiError(401, "Invalid Refresh Token");
            } else {
                if (incomingRefreshToken !== user?.refreshToken) {
                    throw new ApiError(401, "Refresh Token has expired or Uused");
                } else {
                    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
                    return req.status(200)
                        .cookie("accessToken", accessToken, cookieOptions)
                        .cookie("refreshToken", newRefreshToken, cookieOptions)
                        .json(new ApiResponse(
                            200,
                            { accessToken, newRefreshToken },
                            "Access token refreshed successfully"
                        ))
                }
            }
        } catch (error) {
            throw new ApiError(500, error?.message || "Invalid refresh token");
        }
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if ([oldPassword, newPassword].some(field => field?.trim() === "")) {
            throw new ApiError(401, "Invalid attempt");
        } else {
            const user = await User.findById(req.user?._id);
            const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
            if (!isOldPasswordCorrect) {
                throw new ApiError(400, "Invalid password");
            } else {
                user.password = newPassword;
                await user.save({ validateBeforeSave: false });
                return res.status(200).json(
                    new ApiResponse(200, {}, "Password Changed successfully")
                );
            };
        }
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    };
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiError(200, req.user, "Current user fetched successfully"
        ));
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, username, email } = req.body;

    if (!fullName || !email || !username) {
        throw new ApiError(400, "All fields are required");
    } else {
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName, username, email
                }
            },
            { new: true }
        ).select("-password");

        return res.statu(200)
            .json(new ApiResponse(
                200,
                user,
                "Account details updated successfully"
            ));
    };
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    } else {
        const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarUrl) {
            throw new ApiError(500, "Error while uploading");
        } else {
            const user = await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set: {
                        avatar: avatarUrl
                    }
                },
                { new: true }
            ).select("-password");

            return res.status(200).json(
                new ApiResponse(200, user, "Avatar is updated succesfully")
            );
        };
    };
});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const covaerImageLocalPath = req.file?.path;

    if (!covaerImageLocalPath) {
        throw new ApiError(400, "Cover Image is missing");
    } else {
        const coverImageUrl = await uploadOnCloudinary(covaerImageLocalPath);
        if (!coverImageUrl) {
            throw new ApiError(500, "Error while uploading");
        } else {
            const user = await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set: {
                        coverImage: coverImageUrl
                    }
                },
                { new: true }
            ).select("-password");

            return res.status(200).json(
                new ApiResponse(200, user, "Cover Image is updated succesfully")
            );
        };
    };
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};