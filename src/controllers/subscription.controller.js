import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;
    // TODO: toggle subscription
    if (!(channelId && userId)) {
        throw new ApiError(401, "Channel ID is required");
    } else if (!(isValidObjectId(channelId) && isValidObjectId(userId))) {
        throw new ApiError(401, "Valid channel Id is required");
    } else {
        const theChannel = await Subscription.exists({
            $and: [
                { subscriber: userId },
                { channel: channelId },
            ]
        });
        if (theChannel) {
            await Subscription.findByIdAndDelete(theChannel._id);
            return res.status(200).json(
                new ApiResponse(200, {}, "The channel is Unsubscribed")
            );
        } else {
            const subscriptionDocCreated = await Subscription.create({
                subscriber: userId,
                channel: channelId
            });
            await subscriptionDocCreated.save();
            return res.status(200).json(
                new ApiResponse(200, {}, "The channel is Subscribed")
            );
        };
    };
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(401, "Channel Id is required");
    } else if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Valid Channel Id is required");
    } else {
        try {
            const allTheSubscribers = await Subscription.aggregate([
                {
                    $match: {
                        channel: new mongoose.Types.ObjectId(channelId)
                    }
                },
                {
                    $project: {
                        subscriber: 1
                    }
                }
            ]);
            return res.status(200).json(
                new ApiResponse(
                    200,
                    allTheSubscribers,
                    "Subscribers fetched"
                )
            );
        } catch (error) {
            throw new ApiError(500, "Valid Channel Id is required");
        };
    };
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    try {
        const allTheChannels = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $project: {
                    channel: 1
                }
            }
        ]);
        return res.status(200).json(
            new ApiResponse(
                200,
                allTheChannels,
                "Subscribers fetched"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Valid Channel Id is required");
    };
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};