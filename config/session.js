const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
require("dotenv").config();

const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/test",
    collection: "session"
})

store.on("error", function (error) {
    console.log(error);
})

//initialize session storege
const sessionMiddleWare = session({
    store: store,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,  //1 DAY
        secure: true
    }
    
})

module.exports = sessionMiddleWare;