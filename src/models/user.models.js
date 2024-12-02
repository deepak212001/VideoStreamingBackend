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

        fullname: {
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
                tyoe: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: string
        }
    },
    {
        timestamps: true
    }

)


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // if user only change another detail that time return only next()

    this.password = bcrypt.hash(this.password, 10)
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
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRYF
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
            expiresIn: process.env.REFRESH_TOKEN_EXPIRYF
        }
    )
}



export const User = mongoose.model("User", userSchema)