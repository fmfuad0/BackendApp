import mongoose from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { User } from "../models/user.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description)
        throw new apiError(400, "Provide name and description")

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user._id
    })
    if (!playlist)
        throw new apiError(400, "Error creating playlist")
    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "Playlist created")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { username } = req.params
    console.log(username);


    if (!username)
        throw new apiError(400, "username is missing")

    try {
        const playlists = await Playlist.find(
            {
                "owner": req.user?._id,
            }
        )

        console.log(playlists);

        return res
            .status(200)
            .json(
                new apiResponse(200, playlists, "Playlists fetched")
            )

    } catch (error) {
        throw new apiError(400, "Error fetching playlists")
    }

    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId)
        throw new apiError(400, "playlistId is missing")

    const playlist = await Playlist.findById(new mongoose.Types.ObjectId(playlistId))
    console.log(playlist);

    if (!playlist)
        return new apiError(400, "Could not get playlist")
    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "Playlist found")
        )
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    console.log(playlistId, videoId);
    const playlistVideos = (await Playlist.findById(playlistId)).videos

    if (playlistVideos.includes(new mongoose.Types.ObjectId(videoId)))
        throw new apiError(400, "Video allready added in this playlist")
    try {
        const playlist = await Playlist.findOneAndUpdate(

            new mongoose.Types.ObjectId(playlistId),
            {
                $push: {
                    videos: new mongoose.Types.ObjectId(videoId)
                }
            },
            { new: true }
        )
        console.log(playlist);

        return res
            .status(200)
            .json(
                new apiResponse(200, playlist.videos, "Video successfully added")
            )
    } catch (error) {
        throw new apiError(400, "Error adding video to playlist")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const playlistVideos = (await Playlist.findById(new mongoose.Types.ObjectId(playlistId))).videos
    console.log(playlistVideos);

    if ((playlistVideos.includes(new mongoose.Types.ObjectId(videoId))))
    {
        try {
            const playlist = await Playlist.findByIdAndUpdate(
                new mongoose.Types.ObjectId(playlistId),
                {
                    $pull: {
                        videos: new mongoose.Types.ObjectId(videoId)
                    }
                },
                { new: true }
            )

            return res
                .status(200)
                .json(
                    new apiResponse(200, playlist, "Video successfully removed")
                )
        } catch (error) {
            throw new apiError(400, "Error removing video from playlist")
        }
    }
    else
        throw new apiError(404, "Video not found in this playlist")

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const playlist = await Playlist.findById(new mongoose.Types.ObjectId(playlistId))
    if (!playlist)
        throw new apiError(404, "Playlist not found")
    try {
        await Playlist.findByIdAndDelete(new mongoose.Types.ObjectId(playlistId))
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "Playlist deleted")
            )
    } catch (error) {
        throw new apiError(400, "Could not delete playlist ")
    }
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!playlistId || !name || !description)
        throw new apiError(400, "All fields are required")

    const playlist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            name: name,
            description: description
        },
        { new: true }
    )
    if (!playlist)
        throw new apiError(400, "playlist not found")
    return res
        .status(200)
        .json(
            new apiResponse(200, playlist ,"Playlist updated successfully")
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
