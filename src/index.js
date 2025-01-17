// require('dotenv').config({ path: './env' })
// aur

import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})


import connectDB from "./db/index.js"
import { app } from './app.js'


connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error
        })
        app.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️  Servie is running at : ${process.env.PORT}`);
        })

    })
    .catch((err) => {
        console.log("MONGODB connection failed !! re ", err)
    })