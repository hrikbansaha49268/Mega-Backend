import mongoose from "mongoose";
import { VideoSchema } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like, total likes, total comments and total tweets.
    const userId = req.user?._id;

    // Video views
    const videos = await VideoSchema.find({ owner: userId });
    const viewsCounter = [];
    videos.forEach(e => viewsCounter.push(e.views));
    const totalViews = viewsCounter.reduce((acc, current) => acc + current, 0);
    // Video views

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


    return res.status(200).json({ data: totalViews });
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
});

export {
    getChannelStats,
    getChannelVideos
};