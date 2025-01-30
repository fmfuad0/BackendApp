import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js"
import { apiResponse } from "../utils/apiResponse.js"
import { request } from "http"

const healthCheckReport = {
    completed: false,
    checks: {}
}

const params = {
    videoId: "67995f21c619407508d25176",
    commentId: "6799bd5bdd781edbb0783318",
    tweetId: "6799cd98b1f501daffe1987b",
    playlistId: "679a043092bcdd982e78d05e",
    username: "fmfuad"

}

const reqBody = {
    username: "fmfuad",
    password: "password",
    oldPassword: "password",
    newPassword: "password",
    confirmPassword: "password",
    newFullName: "New Full name",
    newEmail: "new email",
    newContent: "Healthcheck updated comment content",
    content: "Healthcheck content",
    updatedContent: "Healthcheck updated tweet content",
    title: "Healthcheck Title",
    description: "Healhcheck description",
    name: "Healthcheck newPlaylist"

}

const healthCheck = async (req, res, next) => {
    ////ADD and DELETE comment check seperately together

    const addCommentResult = await fetch(`${process.env.server}/comments/new/c/${params.videoId}`, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJlbWFpbCI6Im5ldyBlbWFpbCIsInVzZXJuYW1lIjoiZm1mdWFkIiwiZnVsbE5hbWUiOiJOZXcgRnVsbCBuYW1lIiwiaWF0IjoxNzM4MjMyMDkwLCJleHAiOjE3MzgzMTg0OTB9.6er1ofT94pY4GXeT0NjTzCXUtIG6tXPHYrwURfEpE8Y; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJpYXQiOjE3MzgyMzIwOTAsImV4cCI6MTczOTA5NjA5MH0.kpORw7hmmhIGkgNsWZTerTPTIj6NbtgjwvmHHPuIxpo'
        },
        body: {
            "content": "New comment content"
        }
    })

    console.log(addCommentResult);
    


    return res.status(200)
        .json(
            new apiResponse(200, healthCheckReport, "Scanning completed")
        )
}

export { healthCheck }