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


app.use(express.urlencoded({extended:true,limit:"16kb"}))
// ye url ko encode karta hai 

app.use(express.static("public"))
// file ya folder save karta hai public folder me 

app.use(cookiesParser())

export { app }