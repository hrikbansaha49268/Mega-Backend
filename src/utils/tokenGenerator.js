import { User } from "../models/user.model.js";
import { ApiError } from "./errorHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const tokenGenUser = await User.findById(userId);
        const accessToken = tokenGenUser.generateAccessToken();
        const refreshToken = tokenGenUser.generateRefreshToken();

        tokenGenUser.refreshToken = refreshToken;
        await tokenGenUser.save({ valiadateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generationg Refresh and Access token");
    }
};

export default generateAccessAndRefreshToken;