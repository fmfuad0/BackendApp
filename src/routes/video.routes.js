import express from 'express'; 
const videoRouter = express.Router();
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import {
    deleteVideo,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from '../controllers/video.controllers.js';


videoRouter.route('/publish').post(verifyJWT, upload.single("video"), publishAVideo);
videoRouter.route('/c/:videoId').get(getVideoById);
videoRouter.route('/update/c/:videoId').post(verifyJWT, updateVideo);
videoRouter.route('/delete/c/:videoId').get(verifyJWT, deleteVideo);
videoRouter.route('/publish/toggle/c/:videoId').get(verifyJWT, togglePublishStatus);
export {videoRouter};