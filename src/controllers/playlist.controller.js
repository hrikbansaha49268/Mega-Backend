import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/errorHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!req?.user) {
        throw new ApiError(401, "Unauthorized Request");
    } else {
        try {
            const newPlaylist = await Playlist.create({
                name,
                description,
                owner: req.user?._id
            });
            await newPlaylist.save();
            return res.status(200).json(
                new ApiResponse(200, newPlaylist, "New playlist created")
            );
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    };
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(401, "Unauthorized Request");
    } else if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid Playlist");
    } else {
        try {
            const theUserPlaylistsArray = await Playlist.aggregate([
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId),
                    },
                },
            ]);
            return res.status(200).json(
                new ApiResponse(
                    200,
                    theUserPlaylistsArray,
                    "These are the playlists created by the user"
                )
            );
        } catch (error) {
            throw new ApiError(500, error.message);
        };
    };
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(401, "Playlist Id is required");
    } else if (isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invaid Playlist Id");
    } else {
        try {
            const theSpcificPlaylist = await Playlist.findById(playlistId);

            return res.status(200).json(
                new ApiResponse(200, theSpcificPlaylist, "Playlist has been found")
            )
        } catch (error) {
            throw new ApiError(500, error.message);
        }
    };
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!(playlistId && videoId)) {
        throw new ApiError(401, "Playlist or Video not found");
    } else if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(401, "Playlist or Video valid Id is required");
    } else {
        try {
            const userPlaylist = await Playlist.findById(playlistId);
            if (!userPlaylist) {
                throw new ApiError(401, "Playlist or Video valid Id is not found");
            } else {
                userPlaylist.videos.push(videoId);
                await userPlaylist.save();
            }
        } catch (error) {
            throw new ApiError(500, error.message);
        };
    };
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!(playlistId && videoId)) {
        throw new ApiError(401, "Playlist or Video not found");
    } else if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(401, "Playlist or Video valid Id is required");
    } else {
        try {
            const userPlaylist = await Playlist.findById(playlistId);
            if (!userPlaylist) {
                throw new ApiError(401, "Playlist or Video valid Id is not found");
            } else {
                userPlaylist.videos.pull(videoId);
                await userPlaylist.save();

                return res.status(200).json(new ApiResponse(200, {}, "Video deleted succesfully"));
            }
        } catch (error) {
            throw new ApiError(500, error.message);
        };
    };

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!(playlistId)) {
        throw new ApiError(401, "Playlist not found");
    } else if (!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Playlist valid Id is required");
    } else {
        try {
            const userPlaylistForRemoval = await Playlist.exists(playlistId);
            if (!userPlaylistForRemoval) {
                throw new ApiError(401, "Playlist or Video valid Id is not found");
            } else {
                await Playlist.findByIdAndDelete(playlistId);
                return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted succesfully"));
            };
        } catch (error) {
            throw new ApiError(500, error.message);
        };
    };
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!playlistId) {
        throw new ApiError(401, "Playlist or Video not found");
    } else if (!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Playlist or Video valid Id is required");
    } else if (!(name && description)) {
        throw new ApiError(401, "Description and Name valid Id is required");
    } else {
        try {
            const userPlaylist = await Playlist.exists(playlistId);
            if (!userPlaylist) {
                throw new ApiError(401, "Playlist or Video valid Id is not found");
            } else {
                const updatedSpeciificPlaylist = await Playlist.findByIdAndUpdate(name, description);
                return res.status(200).json(new ApiResponse(200, updatedSpeciificPlaylist, "Playlist Updated succesfully"));
            };
        } catch (error) {
            throw new ApiError(500, error.message);
        };
    };
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};