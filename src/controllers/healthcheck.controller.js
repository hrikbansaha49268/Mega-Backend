import { ApiError } from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const healthcheck = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, {}, "OK! Server is working properly"));
    } catch (error) {
        throw new ApiError(500, "Server is not working")
    };
});

export { healthcheck };