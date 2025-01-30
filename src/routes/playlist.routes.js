import { Router } from "express"
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist } from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const playlistRouter = Router();
// Routes
playlistRouter.route("/c/:playlistId").get(verifyJWT, getPlaylistById);
playlistRouter.route("/new").post(verifyJWT, createPlaylist);
playlistRouter.route("/users/c/:username").get(verifyJWT, getUserPlaylists);
playlistRouter.route("/c/:playlistId/add/c/:videoId").get(verifyJWT, addVideoToPlaylist);
playlistRouter.route("/c/:playlistId/remove/c/:videoId").get(verifyJWT, removeVideoFromPlaylist);
playlistRouter.route("/delete/c/:playlistId").get(verifyJWT, deletePlaylist);
playlistRouter.route("/update/c/:playlistId").post(verifyJWT, updatePlaylist);


export {playlistRouter}