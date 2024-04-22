import mongoose, { isValidObjectId } from "mongoose"
import { VideoSchema } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1,
        userId } = req.query;

    const matchCondition = {
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    };
    if (userId) {
        matchCondition.owner = new mongoose.Types.ObjectId(userId);
    };
    var videoAggregate;
    try {
        videoAggregate = Video.aggregate([
            {
                $match: matchCondition

            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                avatar: "$avatar.url",
                                username: 1,
                            }
                        },
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner",
                    },
                },
            },
            {
                $sort: {
                    [sortBy || "createdAt"]: sortType || 1
                }
            },

        ]);
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error in video aggregation");
    };

    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    Video.aggregatePaginate(videoAggregate, options)
        .then(result => {
            if (result?.videos?.length === 0 && userId) {
                return res.status(200).json(new ApiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        }).catch(error => {
            throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
        });
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
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "This video is unavailable");
    } else {
        const theSpecificVideo = await VideoSchema.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                avatar: 1
                            },
                        },
                        {
                            $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "channel",
                                as: "subscribers"
                            }
                        },
                        {
                            $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "subscriber",
                                as: "subscribedTo"
                            }
                        },
                        {
                            $addFields: {
                                subscribersCount: {
                                    $size: "$subscribers"
                                },
                                channelsSubscribedToCount: {
                                    $size: "$subscribedTo"
                                },
                                isSubscribed: {
                                    $cond: {
                                        if: {
                                            $in: [req.user?._id, "$subscribers.subscriber"]
                                        },
                                        then: true, else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                subscribersCount: 1,
                                channelsSubscribedToCount: 1,
                                isSubscribed: 1,
                                avatar: 1,
                                coverImage: 1,
                                email: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(200, theSpecificVideo[0]));
    };
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Video is not available");
    } else {
        const { title, description } = req?.body;
        if (!title) {
            throw new ApiError(401, "Title is missing")
        } else if (!description) {
            throw new ApiError(401, "Description is missing")
        }
        const thumbnailLocalPath = req.file?.path;
        // if (!thumbnailLocalPath) {
        //     throw new ApiError(401, "Thumbnail is missing");
        // }
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        const theVideoInstance = await VideoSchema.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title, description, thumbnail: uploadedThumbnail?.url
                }
            },
            { new: true }
        );
        return res.status(200).json(new ApiResponse(200, theVideoInstance, "Video details update succesfully"));
    };

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        try {
            await VideoSchema.findByIdAndDelete(videoId);
            res.status(200).json(200, {}, "Video has been deleted Succesfully");
        } catch (error) {
            new ApiError(401, error.message);
        };
    };
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(req.user?._id) || req.user._id === (null || undefined)) {
        throw new ApiError(401, "Unauthorized request");
    } else {
        if (!isValidObjectId(videoId)) {
            throw new ApiError(401, "Invalid ID");
        } else {
            try {
                const theVideoInstance = await VideoSchema.findById(videoId);
                theVideoInstance.isPublished = !theVideoInstance.isPublished;
                await theVideoInstance.save({ validateBeforeSave: false });
                return res.status(200).json(new ApiResponse(200, theVideoInstance, "Video has been unpublished"));
            } catch (error) {
                new ApiError(401, error.message);
            };
        };
    };
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}