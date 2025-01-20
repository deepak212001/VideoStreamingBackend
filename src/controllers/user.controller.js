import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefereshToken = async (userId) => {
    console.log("userId", userId);
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Something went wrong while generating Access And Referesh token")
        }

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        // validateBeforeSave: false means password validation is not required

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access And Referesh token at starting point")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // return res.status(200).json({
    //     message: "ok"
    // }) // for check api is working or not

    // get user details from frontend
    // validation means email not empty, password not empty, email is valid
    // check if user already exists in the database , check either email or username or both
    // check for images , check for avatar , if yes then upload to cloudinary, avatar 
    // create user object - create entry in db
    // remove password and refresh token fields from the response
    // check for user creation
    // return response with http status

    const { fullName, email, username, password } = req.body
    console.log("email", email);


    // if (fullName === "") {
    //     throw new ApiError(400, "Full Name is required")
    // }
    // we can also use this method to check if the email is empty or not and check all detail 

    // aur
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // means har field ko trim kar ke check karega agr trim ke bad ek bhi field empty hai to condition true
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists in the database , check either email or username or both
    // $or: [{ email }, { user }] means email or user name
    const existedUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }


    // console.log("req.body", req.body);
    /*
    req.body [Object: null prototype] {
                fullName: 'deepak yadav',
                username: 'deepak199',
                password: '12345qwer',
                email: 'deepak@gmail.com'
                }
    */


    // console.log("req.files", req.files);
    /*
    req.files [Object: null prototype] {
        avatar: [
          {
            fieldname: 'avatar',
            originalname: 'vinod.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            destination: './public/temp',
            filename: 'vinod.jpg',
            path: 'public\\temp\\vinod.jpg',
            size: 27351
          }
        ],
        coverImage: [
          {
            fieldname: 'coverImage',
            originalname: 'sign_vinod.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            destination: './public/temp',
            filename: 'sign_vinod.jpg',
            path: 'public\\temp\\sign_vinod.jpg',
            size: 18349
          }
        ]
      }
      */
    // const avatarLocalPath = req.files?.avatar[0]?.path means avatar[0] meanth array ka first object and hai to uska path
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    // aur
    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPth = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar)
        throw new ApiError(400, "Avatar is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // const createdUser = await User.findById(user._id) //for check user is created or not

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // remove password and refresh token fields from the response

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User Registered Successfully"))
    // new object bcz apiresponse is a class


})


const loginUser = asyncHandler(async (req, res) => {
    // get email and password from frontend (req body)
    // check if email/username and password are not empty
    // check if user exists in the database
    // check if password is correct
    // generate jwt token (asses token and refresh token)
    // save the token in the database
    // return response with http status

    const { email, username, password } = req.body

    // if (!(email || username)) //aur
    if (!email && !username) {
        throw new ApiError(400, "Email or username is required")
    }

    // if ([user, password].some((field) => field?.trim() === "")) {
    //     throw new ApiError(400, "All fields are required")
    // }

    const user = await User.findOne({ $or: [{ email }, { username }] })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User credentials")
    }

    // generate token
    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id)

    // const accessToken = user.generateAccessToken()
    // const refreshToken = user.generateRefreshToken()

    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Something went wrong while generating token")
    }
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    //cookies send karna  hai to ye kuchh options(object) karne hote hai  
    // by default koi bhi modiication kar sakta hai
    // par agar httpOnly: true karenge to only server can modify the cookie

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken, user: loggedInUser }, "User logged in successfully"))
})


const logoutUser = asyncHandler(async (req, res) => {
    // clear the token from the database
    // clear the token from the cookie
    // return response with http status


    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    else
        console.log("user", user);

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))

})


const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from the cookie
    // check if refresh token is valid
    // generate new access token
    // return response with http status

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    //  req.cookies.refreshToken  for website || req.body.refreshToken for mpbile app


    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )



        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invaild refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invail refresh token request")

    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    // get current password, new password and confirm password from frontend
    // check if current password, new password and confirm password are not empty
    // check if new password and confirm password are same
    // check if current password is correct
    // update the password in the database
    // return response with http status

    const { currentPassword, newPassword, confirmPassword } = req.body

    if ([currentPassword, newPassword, confirmPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password should be same")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid current password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))

})


const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User details fetched successfully"))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    // get updated details from frontend
    // check if updated details are not empty
    // check if user exists in the database
    // update the user details in the database
    // return response with http status

    const { fullName, email, username } = req.body

    if ([fullName, email, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    /*
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    user.fullName = fullName
    user.email = email
    user.username = username

    await user.save({ validateBeforeSave: false })
    // aur
    */
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email: email,
                username
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details updated successfully"))

})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // get avatar from frontend
    // check if avatar is not empty
    // check if user exists in the database
    // upload avatar to cloudinary
    // update avatar in the database
    // return response with http status

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("req.files", req.file);
    const avatarLocalPath = req.file?.path // bcz ek hi file hai to direct path bhi likh sakte hai
    console.log("avatarLocalPath ", avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // Fetch the current user
    let user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Remove the current avatar from Cloudinary if it exists
    let publicId
    if (user.avatar) {
        publicId = user.avatar.split('/').pop().split('.')[0];
    }
    console.log('publicId:', publicId);
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    // await cloudinary.uploader.destroy(publicId);
    const deleteResponse = await deleteOnCloudinary(publicId);
    console.log('Old avatar deleted:', deleteResponse);


    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // get CoevrImage from frontend
    // check if CoevrImage is not empty
    // check if user exists in the database
    // upload CoevrImage to cloudinary
    // update CoevrImage in the database
    // return response with http status

    console.log("req.file", req.file);
    const coverImageLocalPath = req.file?.path // bcz ek hi file hai to direct path bhi likh sakte hai
    console.log("coverImageLocalPath ", coverImageLocalPath);
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is required")
    }


    // Fetch the current user
    let user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Remove the current coverimage from Cloudinary if it exists
    let publicId
    if (user.coverImage) {
        publicId = user.coverImage.split('/').pop().split('.')[0];
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading cover Image")
    }

    user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    await deleteOnCloudinary(publicId);
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"))

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    // get user id from frontend
    // check if user exists in the database
    // return response with http status

    const { username } = req.params //url se id fetch karna hai to params se fetch karenge

    if (!username.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subcribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subcribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subcribers" },
                channelsSubcribedToCount: { $size: "$subcribedTo" },
                isSubcribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subcribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subcribersCount: 1,
                channelsSubcribedToCount: 1,
                isSubcribed: 1,
                avatar: 1,
                coverImage: 1,
                emial: 1

            }
        }
    ])

    console.log("channel : ", channel);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found aur channel does not exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User details fetched successfully"))

})

const getWatchHistory = asyncHandler(async (req, res) => {
    // get user id from frontend
    // check if user exists in the database
    // get watch history of the user
    // return response with http status

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 0,
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { 
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])


    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

// 200 is a https status code which means ok
// 400 is a https status code which means bad request
// 500 is a https status code which means internal server error
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}