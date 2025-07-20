import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import { User } from '../models/user.models.js'


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        //get the token from the cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]
        // .replace("Bearer ", "") 
        // if we are sending the token in the header then we have to remove the bearer from the token
        // Authorization: Bearer <token>   use in mobile app 
        if (!token) {
            return new ApiError(401, "Unauthenticated request")
        }
        // console.log("token", token)
        //verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log("decodedToken", decodedToken)
        /*
        decodedToken {
        _id: '678f599e9184febc3421a663',
        email: 'deepak@yadav.com',
        username: 'deepak2199',
        fullName: 'deepak yadav',
        iat: 1752923626,
        exp: 1753010026
        }
        */
        if (!decodedToken) {
            return new ApiError(401, "Unauthenticated request")
        }
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            return new ApiError(401, "Invaild Access Token request")
        }

        // console.log("user", user)
        /*
        user {
        _id: new ObjectId('678f599e9184febc3421a663'),
        username: 'deepak2199',
        email: 'deepak@yadav.com',
        fullName: 'deepak yadav',
        avatar: 'http://res.cloudinary.com/deepak2199/image/upload/v1737447834/wowgmqifowyhyvodudlt.jpg',
        coverImage: 'http://res.cloudinary.com/deepak2199/image/upload/v1737447835/zp6hqk64zk407gp0arjd.jpg',
        watchHistory: [],
        password: '$2b$10$G4d1eZDpaS6zv6qRBzWwI.V.V3b8IvE1ww6FpHKSjIF2b7cPka8xK',
        createdAt: 2025-01-21T08:23:58.037Z,
        updatedAt: 2025-07-19T11:14:07.439Z,
        __v: 0
        }
        */
        req.user = user;
        // attach the user to the request object , that is not a nessary use the user word we can use anything
        // req.deep=user; but it is not a good practice to use the user word
        // and then we can use the user in the next middleware or controller
        next()
    } catch (error) {
        return new ApiError(401, "Unauthenticated request")

    }
})