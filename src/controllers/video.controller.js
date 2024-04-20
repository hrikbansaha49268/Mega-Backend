import mongoose, { isValidObjectId } from "mongoose"
import { VideoSchema } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const doesUserExists = await User.exists(req.user?._id);
    if (!doesUserExists) {
        throw new ApiError(401, "Unauthorized Request, not processed");
    } else {
        const videoFileLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
        if (!videoFileLocalPath || !thumbnailLocalPath) {
            throw new ApiError(401, "Video File or Thumbnail is missing");
        } else {
            const videoFileUpload = await uploadOnCloudinary(videoFileLocalPath);
            const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
            const video = await VideoSchema.create({
                videoFile: videoFileUpload.url,
                thumbnail: thumbnailUpload.url || "",
                title: title,
                description: description,
                duration: videoFileUpload.duration,
                owner: req.user?._id
            });
            video.save();
            return res.status(200).json(
                new ApiResponse(200, video, "Video uploaded successfully")
            );
        };
    };
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}