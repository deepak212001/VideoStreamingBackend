import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import {User} from '../models/user.models.js'


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        //get the token from the cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]
        // .replace("Bearer ", "") 
        // if we are sending the token in the header then we have to remove the bearer from the token
        // Bearer <token> 
        if (!token) {
            return new ApiError(401, "Unauthenticated request")
        }

        console.log("token", token)

        //verify the token
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decodedToken", decodedToken)

        if (!decodedToken) {
            return new ApiError(401, "Unauthenticated request")
        }
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            return new ApiError(401, "Invaild Access Token request")
        }
    
        console.log("user", user)
        req.user = user;
        next()
    } catch (error) {
        return new ApiError(401, "Unauthenticated request")
        
    }
})