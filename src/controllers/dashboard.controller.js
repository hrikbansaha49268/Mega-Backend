import mongoose, { isValidObjectId } from "mongoose";
import { VideoSchema } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get total likes.
    const userId = req.user?._id;

    // Video views
    const videos = await VideoSchema.find({ owner: userId });
    const viewsCounter = [];
    videos.forEach(e => viewsCounter.push(e.views));
    // Video views
    const totalViews = viewsCounter.reduce((acc, current) => acc + current, 0);

    const totalNumberOfVideos = videos.length();

    const totalSubscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $count: "numberOfSubscribers",
            },
        ]
    );

    const totalTweets = await Tweet.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $count: "numberOfTweets",
            },
        ]
    );

    const totalComments = await Comment.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $count: "numberOfComments",
            },
        ]
    );

    const likes = [];
    for (let videoId of videos) {
        const likeDocument = await Like.find({ video: videoId });
        likes.push(likeDocument[0]);
    }

    return res.status(200).json(new ApiResponse(200,
        {
            totalViews, totalNumberOfVideos, totalSubscribers, totalTweets, totalComments, totalLikes: likes.length
        }
        , "Channel Stats are available"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (isValidObjectId(userId) || userId != (undefined || null)) {
        try {
            const videosofTheChannel = await VideoSchema.aggregate([
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $project: {
                        videoFile: 1,
                        thumbnail: 1,
                        title: 1,
                        description: 1
                    }
                }
            ]);
            return res.status(200).json(
                new ApiResponse(
                    200,
                    videosofTheChannel,
                    "Videos fetched succesfully"
                )
            );
        } catch (error) {
            throw new ApiError(500, "Internal Server Error");
        };
    };
});

export {
    getChannelStats,
    getChannelVideos
};