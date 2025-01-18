import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true  // ye database ke searching me aayega thoda optimize hai
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, //cloudinary url  this is like aws services
            required: true,
        },

        coverImage: {
            type: String, //cloudinary url  this is like aws services
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }

)


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // if user only change another detail that time return only next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})
// means save se pehle ye kam karo
// 10 is round


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    // true aur false
}
// check password is correct aur  not

userSchema.methods.generateAccessToken = function () {
    // console.log("_id", this._id)
    // console.log("email", this.email)
    // console.log("username", this.username)
    // console.log("fullName", this.fullName)
    // console.log("process.env.ACCESS_TOKEN_SECRET", process.env.ACCESS_TOKEN_SECRET)
    // console.log("process.env.ACCESS_TOKEN_EXPI RY", process.env.ACCESS_TOKEN_EXPIRY)
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema)