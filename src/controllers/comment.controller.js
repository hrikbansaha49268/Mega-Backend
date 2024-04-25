import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(401, "Video Id is required");
    } else if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "valid Video Id is required");
    } else {
        const theCommentsOfTheVideo = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $project: {
                    video: 0
                }
            }
        ]);

        const options = {
            page,
            limit,
            customLabels: {
                totalDocs: "totalComments",
                docs: "comments",

            },
            skip: (page - 1) * limit,
            limit: parseInt(limit),
        };

        Comment.aggregatePaginate(theCommentsOfTheVideo, options)
            .then(result => {
                if (result?.comments?.length === 0) {
                    return res.status(200).json(new ApiResponse(200, [], "No Comments found"))
                }
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            result,
                            "Coemments fetched successfully"
                        )
                    )
            }).catch(error => {
                throw new ApiError(500, error?.message || "Internal server error in Comment aggregate Paginate")
            });
    };
});

const addComment = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { videoId } = req.params;
    const { content } = req.body;
    if (!userId) {
        throw new ApiError(401, "User is invalid");
    } else if (!isValidObjectId(userId)) {
        throw new ApiError(401, "User Id is invalid");
    } else {
        if (!videoId) {
            throw new ApiError(401, "Video is unavailable");
        } else if (!isValidObjectId(videoId)) {
            throw new ApiError(401, "Video ID is invalid");
        } else {
            if (content == null || content == undefined) {
                throw new ApiError(401, "Comment content is required");
            } else {
                try {
                    const createdComment = await Comment.create({
                        content,
                        video: videoId,
                        owner: userId
                    });
                    await createdComment.save();
                    return res.status(200).json(new ApiError(200, createdComment, "Commented succesfully"));
                } catch (error) {
                    throw new ApiError(500, error?.message);
                };
            };
        };
    };
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { commentContent } = req.body;
    if (!commentId) {
        throw new ApiError(401, "Comment Id is required");
    } else if (isValidObjectId(commentId)) {
        throw new ApiError(401, "Valid Comment Id is required");
    } else {
        if (commentContent == null || commentContent == undefined) {
            throw new ApiError(401, "Content is required");
        } else {
            const updateableComment = await Comment.findByIdAndUpdate(
                commentId,
                { content: commentContent }
            );
            res.status(200).json(
                new ApiResponse(200, updateableComment, "Content is updated succesfully")
            );
        };
    };
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(401, "Comment Id is required");
    } else if (isValidObjectId(commentId)) {
        throw new ApiError(401, "Valid Comment Id is required");
    } else {
        try {
            await Comment.findByIdAndUpdate(
                commentId,
                { content: commentContent }
            );
            res.status(200)
                .json(new ApiResponse(200, {}, "Content is updated succesfully"));
        } catch (error) {
            throw new ApiError(500, "Comment not deleted. Please try again");
        };
    };
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};