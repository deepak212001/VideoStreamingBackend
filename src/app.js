import express from "express"
import cors from "cors"
import cookiesParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
// that line give allows to accept json file and only not accept more than size limit


app.use(express.urlencoded({ extended: true, limit: "16kb" }))
// ye url ko encode karta hai 

app.use(express.static("public"))
// file ya folder save karta hai public folder me 

app.use(cookiesParser())
// cookies ko parse karta hai menas cookies ko read karta hai aur cookies ko use karta hai aur cookies ko delete karta hai ye sirf cookies ko parse se severe read use delete karta hai



//routes
import userRouter from './routes/user.routers.js'

//routes declaration means usage   
app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users/register


export { app }