
//try catch method
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

//*********************//

///promise method
const asyncHandler = (requestHandler) =>{
    (req, res, next) =>{
        Promise.resolve().catch((err) => next(err))
    }
}

export {asyncHandler}