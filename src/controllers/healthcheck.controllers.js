import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { env } from "process";
import { questionEMail } from "readline-sync";


let healthCheckObject = {}




const health = async (req, res, next) => {
    const healthCheckReport = {};
    console.log("***HEALTH CHECK RUNNING**");

    ////USER

    const loginResult = await fetch(`${process.env.server}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(
            {
                username: (process.env.username).toLowerCase(),
                password:  process.env.password,
                email: process.env.email
            }
        )
    });
    (!(await loginResult.ok)) ? ((healthCheckReport.login = false), console.log("Login failed")) : healthCheckReport.login = (await loginResult.json() ? true : false)
    // console.log(process.env.username, process.env.password);

    //Logout
    healthCheckReport.logout = User.find() ? true : false

    const changePasswordResult = fetch("http://127.0.0.1:8000/api/v1/users/change-password", {
        method: "POST",
        headers: {
             "Content-Type": "application/json",
             "cookie": "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJlbWFpbCI6Im5ldyBlbWFpbCIsInVzZXJuYW1lIjoiZm1mdWFkIiwiZnVsbE5hbWUiOiJOZXcgRnVsbCBuYW1lIiwiaWF0IjoxNzM3MTMzNjY3LCJleHAiOjE3MzcyMjAwNjd9.v0pOZhyixm4Q_b8B4aRYd0Tvn2Zf-ermbfD9kdRhkrk; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJpYXQiOjE3MzcxMzM1MzUsImV4cCI6MTczNzk5NzUzNX0.FRCKBe4mX9qyXjO2iD4nao2l8h2PKRkazSBdf8jiuDc"
         },
        body: JSON.stringify({
            oldPassword: "password",
            newPassword: "password",
            confirmPassword: "password",
        })
    });
    (!(await changePasswordResult).ok) ? (console.log("change password failed"), healthCheckReport.changePassword = false) : ((await changePasswordResult).json() ? healthCheckReport.changePassword = true : false)


    ///COMMENT
    const addCommentResult = await fetch("http://127.0.0.1:8000/api/v1/comments/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cookie": "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJlbWFpbCI6Im5ldyBlbWFpbCIsInVzZXJuYW1lIjoiZm1mdWFkIiwiZnVsbE5hbWUiOiJOZXcgRnVsbCBuYW1lIiwiaWF0IjoxNzM3MTMzNjY3LCJleHAiOjE3MzcyMjAwNjd9.v0pOZhyixm4Q_b8B4aRYd0Tvn2Zf-ermbfD9kdRhkrk; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJpYXQiOjE3MzcxMzM1MzUsImV4cCI6MTczNzk5NzUzNX0.FRCKBe4mX9qyXjO2iD4nao2l8h2PKRkazSBdf8jiuDc"
        },
        body: JSON.stringify({
            content: "Health check comment content",
            videoId: "6787db18e42e5c4d942e642f",
        }),
        user: JSON.stringify({
            _id: "new ObjectId('678570d1dfde382f3b179348')"
        })
    });
    (!addCommentResult.ok) ? (console.log("Failed to add comment during health check"), healthCheckReport.addComment = false) : healthCheckReport.addComment = addCommentResult.json()? true : false;
    // console.log(addCommentResult.json()) 
    
    const updateCommentResult = await fetch(`http://127.0.0.1:8000/api/v1/comments/update/c/6787db914cd2a99acfa4e3d5`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cookie": "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJlbWFpbCI6Im5ldyBlbWFpbCIsInVzZXJuYW1lIjoiZm1mdWFkIiwiZnVsbE5hbWUiOiJOZXcgRnVsbCBuYW1lIiwiaWF0IjoxNzM3MTMzNjY3LCJleHAiOjE3MzcyMjAwNjd9.v0pOZhyixm4Q_b8B4aRYd0Tvn2Zf-ermbfD9kdRhkrk; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJpYXQiOjE3MzcxMzM1MzUsImV4cCI6MTczNzk5NzUzNX0.FRCKBe4mX9qyXjO2iD4nao2l8h2PKRkazSBdf8jiuDc"
        },
        body: JSON.stringify({
            newContent: "Health check comment update content"
        }),
    });
    (!updateCommentResult.ok) ? console.log("Failed to update comment during health check") : healthCheckReport.updateComment = updateCommentResult.json() ? true : false;

    const deleteCommentResult = await fetch(`http://127.0.0.1:8000/api/v1/comments/delete/c/${healthCheckObject.createdComment._id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cookie": "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJlbWFpbCI6Im5ldyBlbWFpbCIsInVzZXJuYW1lIjoiZm1mdWFkIiwiZnVsbE5hbWUiOiJOZXcgRnVsbCBuYW1lIiwiaWF0IjoxNzM3MTMzNjY3LCJleHAiOjE3MzcyMjAwNjd9.v0pOZhyixm4Q_b8B4aRYd0Tvn2Zf-ermbfD9kdRhkrk; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzg1NzBkMWRmZGUzODJmM2IxNzkzNDgiLCJpYXQiOjE3MzcxMzM1MzUsImV4cCI6MTczNzk5NzUzNX0.FRCKBe4mX9qyXjO2iD4nao2l8h2PKRkazSBdf8jiuDc"
        },
    });
    (!deleteCommentResult.ok) ? console.log("Failedddd to delete comment during health check") : healthCheckReport.deleteComment = deleteCommentResult.json() ? true : false;

    const getVideoCommentsResult = await fetch("http://127.0.0.1:8000/api/v1/comments/video/c/6787db18e42e5c4d942e642f");
    (!getVideoCommentsResult.ok) ? console.log("Failed to fetch video comments during health check") : healthCheckReport.getVideoComments = getVideoCommentsResult.json() ? true : false;


    console.log(healthCheckObject);
    healthCheckObject = {}
    return res.json(new apiResponse(200, healthCheckReport, "Health check completed"));

}

export { health };
export default healthCheckObject;
