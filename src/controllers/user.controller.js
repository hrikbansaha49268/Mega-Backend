import { User } from '../models/user.model.js';
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";


const registerUser = asyncHandler(async (req, res) => {

    const { fullName, username, password, email } = req.body;

    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    } else {
        const userExistsAlready = User.exists({ $or: [{ username }, { email }] });
        if (userExistsAlready) {
            throw new ApiError(409, "User exists already");
        } else {
            const avatarLocalPath = req.files?.avatar[0]?.path;
            const coverImageLocalPath = req.files?.coverImage[0]?.path;
            if (!avatarLocalPath) {
                throw new ApiError(409, "Avatar is required");
            } else {
                const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
                const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);

                if (!avatarUrl) {
                    throw new ApiError(409, "Avatar is required");
                } else {
                    const user = User.create({
                        fullName,
                        avatar: avatarUrl.url,
                        coverImage: coverImageUrl?.url || "",
                        email,
                        password,
                        username: username.toLowerCase()
                    });
                    await user.save();

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

export { registerUser };