import mongoose from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { User } from "../models/user.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



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
            new apiResponse(200, playlist[0], "Playlist created")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId)
        throw new apiError(400, "userId is missing")

    try {
        const playlists = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "playlists",
                    localField: "_id",
                    foreignField: "owner",
                    as: "userPlaylists"
                }
            }
        ])

        console.log(playlists[0]);

        return res
            .status(200)
            .json(
                new apiResponse(200, playlists[0], "Playlists fetched")
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

    if (!playlist[0])
        return new apiError(400, "Could not get playlist")
    return res
        .status(200)
        .json(
            new apiResponse(200, playlist[0], "Playlist found")
        )

    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    try {
        const playlist = await Playlist.findOneAndUpdate(
    
            new mongoose.Types.ObjectId(playlistId),
            { 
                $push: {
                    video: new mongoose.Types.ObjectId(videoId)
                } 
            },
            {new: true}
        )
        console.log(playlist);
        
        return res
        .status(200)
        .json(
            new apiResponse(200, playlist[0], "Video successfully added")
        )
    } catch (error) {
        throw new apiError(400, "Error adding video to playlist")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    try {
        const playlist = await Playlist.updateOne(
            new mongoose.Types.ObjectId(playlistId),
            { 
                $pull: {
                    videos : new mongoose.Types.ObjectId(videoId)
                } 
            },
            {new: true}
        )
        console.log(playlist);
        
        return res
        .status(200)
        .json(
            new apiResponse(200, playlist[0], "Video successfully added")
        )
    } catch (error) {
        throw new apiError(400, "Error adding video to playlist")
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const playlist = await Playlist.findById(new mongoose.Types.ObjectId(playlistId))
    if(!playlist)
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
    if(!playlistId || !name || !description)
        throw new apiError(400, "All fields are required")
    
    const playlist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            name: name,
            description: description
        },
        {new:true}
)
    if(!playlist)
        throw new apiError(400, "playlist not found")
    return res
    .status(200)
    .json(
        new apiResponse(200, playlist)
    )
    //TODO: update playlist
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
