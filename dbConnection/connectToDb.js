const mongoose = require("mongoose");
require("dotenv").config();

function dbConnect() {

    mongoose.connect(process.env.MONGODB_CONNECTION_URL)

    mongoose.connection.on("connected", () => {
        console.log("Connection to db successful!")
    })

    mongoose.connection.on("error", ()=> {
        console.log("error while connecting to mongodb")
    })
}

module.exports = dbConnect;