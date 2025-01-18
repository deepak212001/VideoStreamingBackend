import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Something went wrong while generating Access And Referesh token")
        }

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        // validateBeforeSave: false means password validation is not required

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access And Referesh token")
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

    if (!email || !username) {
        throw new ApiError(400, "Email or username is required")
    }

    if ([user, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

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
            $set:{
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



// 200 is a https status code which means ok
// 400 is a https status code which means bad request
// 500 is a https status code which means internal server error
export {
    registerUser,
    loginUser,
    logoutUser
}