import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId) || videoId == null) {
        throw new ApiError(401, "Invalid request")
    } else {
        if (!isValidObjectId(req.user?._id) || req.user._id == null) {
            throw new ApiError(401, "Unauthorized Access");
        } else {
            const isLiked = await Like.findOne({ video: videoId });
            if (!isLiked) {
                const likedDoc = Like.create({
                    video: videoId,
                    likedBy: req.user?._id
                });
                await likedDoc.save();

                return res.status(200).json(new ApiResponse(200, {}, "Liked!"));
            } else {
                await Like.findByIdAndDelete(isLiked._id);
                return res.status(200).json(new ApiResponse(200, {}, "Disiked!"));
            };
        };
    };
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId) || commentId == null) {
        throw new ApiError(401, "Invalid request")
    } else {
        if (!isValidObjectId(req.user?._id) || req.user._id == null) {
            throw new ApiError(401, "Unauthorized Access");
        } else {
            const isLiked = await Like.findOne({ comment: commentId });
            if (!isLiked) {
                const likedDoc = await Like.create({
                    comment: commentId,
                    likedBy: req.user?._id
                });
                await likedDoc.save();
                return res.status(200).json(new ApiResponse(200, {}, "Liked!"));
            } else {
                await Like.findByIdAndDelete(isLiked._id);
                return res.status(200).json(new ApiResponse(200, {}, "Disiked!"));
            };
        };
    };

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId) || tweetId == null) {
        throw new ApiError(401, "Invalid request")
    } else {
        if (!isValidObjectId(req.user?._id) || req.user._id == null) {
            throw new ApiError(401, "Unauthorized Access");
        } else {
            const isLiked = await Like.findOne({ tweet: tweetId });
            if (!isLiked) {
                const likedDoc = await Like.create({
                    tweet: tweetId,
                    likedBy: req.user?._id
                });
                await likedDoc.save();
                return res.status(200).json(new ApiResponse(200, {}, "Liked!"));
            } else {
                await Like.findByIdAndDelete(isLiked._id);
                return res.status(200).json(new ApiResponse(200, {}, "Disiked!"));
            };
        };
    };
});

const getLikedVideos = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.user?._id) || req.user._id == null) {
        throw new ApiError(401, "Unauthorized request")
    }
    else {
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $project: {
                    video: 1
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(200, likedVideos, "All the liked videos"));
    };
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};