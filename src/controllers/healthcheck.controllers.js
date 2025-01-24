import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment 
} from "../controllers/comment.controllers.js"

const healthCheckReport = {
    completed : false,
    checks:{}
}

const healthCheck = async (req, res, next)=>{
    const addCommentResult = await fetch(`${process.env.server}/comments/new/c/6787db18e42e5c4d942e642f`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "cookie" : `accessToken=${req.cookies.accessToken}; refreshToken=${req.cookies.refreshToken}`
        },
        body: JSON.stringify({
            content: "Healthcheck content"
        })
      });
    (addCommentResult.ok) ? ((addCommentResult.json()) ? healthCheckReport.addComment = true : healthCheckReport.addComment = false) : healthCheckReport.addComment = false 

    // console.log(res);
    






    return res.status(200)
    .json("Success")
}

export {healthCheck}