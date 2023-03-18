const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
require("dotenv").config();

const store = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_URL,
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
        maxAge: process.env.COOKIE_MAX_AGE  //1 DAY
    }
    
})

module.exports = sessionMiddleWare;