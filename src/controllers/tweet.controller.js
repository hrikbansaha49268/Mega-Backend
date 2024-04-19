import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(404, "Invalid User")
    } else {
        const { tweetContent } = req.body;

        if (!tweetContent) {
            throw new ApiError(401, "Empty Tweet");
        } else {
            const userExist = await User.exists(req.user._id);
            if (!userExist) {
                throw new ApiError(401, "Unauthorized Request");
            } else {
                const theTweet = await Tweet.create({
                    content: tweetContent,
                    owner: req.user._id
                });
                await theTweet.save()
                return res.status(200).json(
                    new ApiResponse(200, theTweet, "Tweet has been posted")
                );
            }
        };
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(404, "Invalid User");
    } else {
        const { userId } = req.params;
        if (!(userId && isValidObjectId(userId))) {
            throw new ApiError(400, "Invalid Request");
        } else {
            const tweets = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId)
                    },
                },
                {
                    $project: {
                        fullName: 1,
                        username: 1,
                    },
                },
                {
                    $lookup: {
                        from: "tweets",
                        localField: "_id",
                        foreignField: "owner",
                        as: "tweets",
                        pipeline: [
                            {
                                $project: {
                                    content: 1,
                                },
                            },
                        ],
                    },
                },
            ]);

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        tweets[0],
                        `Number of tweets is ${tweets[0].tweets?.length}`
                    )
                );
        };
    };
});

const updateTweet = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(404, "Invalid User")
    } else {
        const { tweetId } = req.params;
        const { tweetContent } = req.body;

        if (!(tweetId && isValidObjectId(tweetId))) {
            throw new ApiError(401, "Invalid tweetId");
        } else {
            const theTweet = await Tweet.exists({ _id: tweetId });
            if (!theTweet) {
                throw new ApiError(401, "The tweet is non-existent");
            } else {
                if (!tweetContent) {
                    throw new ApiError(401, "Empty Tweet");
                } else {
                    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
                        $set: {
                            content: tweetContent
                        },
                    }, { new: true }).select("-owner");

                    return res.status(200).json(
                        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
                    );
                };
            };
        };
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    if (condition) {
        throw new ApiError(404, "Invalid User")
    } else {
        const { tweetId } = req.params;

        if (!(tweetId && !isValidObjectId(tweetId))) {
            throw new ApiError(401, "Invalid Request");
        } else {
            const theTweet = await Tweet.exists({ _id: tweetId });
            if (!theTweet) {
                throw new ApiError(401, "Invalid Request");
            } else {
                await Tweet.findByIdAndDelete({ _id: tweetId });

                return res.status(200).json(
                    new ApiResponse(200, {}, "Tweet deleted successfully")
                );
            };
        };
    };
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};