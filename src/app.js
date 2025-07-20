import express from "express"
import cors from "cors"
import cookiesParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
// that line give allows to accept json file and only not accept more than size limit


app.use(express.urlencoded())
// ye url ko encode karta hai 

app.use(express.static("public"))
// file ya folder save karta hai public folder me 

app.use(cookiesParser())
// cookies ko parse karta hai menas cookies ko read karta hai aur cookies ko use karta hai aur cookies ko delete karta hai ye sirf cookies ko parse se severe read use delete karta hai



//routes
import userRouter from './routers/user.routers.js'

//routes declaration means usage   
app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users/register

import healthRouter from './routers/healthcheck.routers.js'
app.use("/api/v1/healthcheck", healthRouter)

import tweetRouter from './routers/tweet.routers.js'
app.use("/api/v1/tweets", tweetRouter)

import subscriptionRouter from './routers/subscription.routers.js'
app.use("/api/v1/subscriptions", subscriptionRouter)

import videoRouter from './routers/video.routers.js'
app.use("/api/v1/videos", videoRouter)

import commentRouter from './routers/comment.routers.js'
app.use("/api/v1/comments", commentRouter)

import playlistRouter from './routers/playlist.routers.js'
app.use("/api/v1/playlists", playlistRouter)

import dashboardRouter from './routers/dashboard.routers.js'
app.use("/api/v1/dashboard", dashboardRouter)

import likeRouter from './routers/like.routers.js'
app.use("/api/v1/likes", likeRouter)




export { app }