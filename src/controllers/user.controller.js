import { asyncHandler } from "../utils/asyncHandler.js"


const registerUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "ok"
    })
})
// 200 is a https status code which means ok
// 400 is a https status code which means bad request
// 500 is a https status code which means internal server error
export { registerUser }