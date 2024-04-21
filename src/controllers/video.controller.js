import mongoose, { isValidObjectId } from "mongoose"
import { VideoSchema } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    // const allVideos = await VideoSchema.find({});
    // const videosAggregate = await VideoSchema.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(userId)
    //         }
    //     }
    // ]);

    // const videosAggregatePaginated = await VideoSchema.aggregatePaginate(videosAggregate, { page, limit });

    // return res.status(200).json(new ApiResponse(200, videosAggregatePaginated, "Succesfully fetched videos"));

});

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
            if (!isValidObjectId(req.user?._id)) {
                throw new ApiError(401, "Unauthorized request");
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
            }
        };
    };
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (isValidObjectId(videoId)) {
        const theSpecificVideo = await VideoSchema.findById(videoId);
        if (!theSpecificVideo) {
            throw new ApiError(500, "This video does not exists");
        } else {
            const aggregatedResponse = await VideoSchema.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoId)
                    }
                },
                {
                    $lookup: {
                        from: "users"
                    }
                }
            ]);
            return res.status(200).json(new ApiResponse
                (
                    200,
                    theSpecificVideo,
                    "The video is fetched succesfully"
                ));
        };
    };
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
        //TODO: update video details like title, description, thumbnail
        ``
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