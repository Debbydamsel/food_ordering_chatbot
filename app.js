const express = require("express");
const dbConnect = require("./dbConnection/connectToDb");
const uuid = require("uuid");

const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT || 3000;
const path = require("path");

const joinPath = path.join(__dirname, "public");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sessionMiddleWare = require("./config/session");
const {categories, category, displayMenus, loopHandler} = require("./controller/categories");
const {placeOrder, getOrders} = require("./controller/orderHistory");

//connection to mongodb
dbConnect();

app.use(sessionMiddleWare);

//socket.io middleware used to store and retrieve sessions
io.use((socket, next) => {
    sessionMiddleWare(socket.request, socket.request.res, next);
});


app.use(express.static(joinPath));
app.use(bodyParser.urlencoded({extended: false}));


io.on("connection", (socket) => {
    console.log("user connected");
    
    //get the session id
    const sessionId = socket.request.session.id;
    

    //attach the user's socketid with the session object
    //this also stores the session id to the socket id
    socket.request.session.socketId = socket.id;

    //get the session which includes the socketid to connect the user to that session
    const sessionData = socket.request.session;


    // if the user id does not already exists create a new one 
     if (!sessionData.userId) {
        //generate a unique userid
        const userId = uuid.v4();
        //join the userid to the session
        socket.request.session.userId = userId;
        socket.request.session.save();
    } 

    //if the userid already exist just use that id for the socket connection
    const userId = sessionData.userId;

    socket.join(sessionId);

    let order = sessionData.order;
    order = [];

    sessionData.save();
    console.log(sessionData);

    socket.emit("bot_message", "Welcome to scrumptious treat😍🍲🍖. Please enter your name below to get started!");

    socket.on("user_input", (msg) => {

       if(!sessionData.name) {
            io.to(sessionId).emit("user_message", msg);
            sessionData.name = msg;
            
            
            io.to(sessionId).emit("bot_message", `Hello ${sessionData.name}👋, we are happy to have you! Please type in any of the numbers below for your request`);
            io.to(sessionId).emit("bot_message", "Type 1 to place your order<br>Type 99 to checkout your order<br>Type 98 to see your order history<br>Type 97 to see your current order<br>Type 0 to cancel your order<br>Thank you!");

        } 
        else {
            io.to(sessionId).emit("user_message", msg);
            
           switch (msg) {
                case "1":
                    sessionData.selection = "menucategories"
                    loopHandler(categories, sessionId, io)
                    break;
                case "99":
                    placeOrder(userId, order, sessionId, io)
                    break;
                case "98":
                    getOrders(userId, sessionId, io)  
                    break;
                case "97":       
                    if (order.length === 0) {
                        io.to(sessionId).emit("bot_message", "No order has been placed yet!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {
                        loopHandler(order, sessionId, io);
                        io.to(sessionId).emit("bot_message", "Press 99 to check out");
                    }
                    break;
                case "0":
                    if (order.length === 0) {
                        io.to(sessionId).emit("bot_message", "you havent placed any order yet so there is no order to cancel!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {
                        order.length = 0;
                        io.to(sessionId).emit("bot_message", "Order cancelled!");
                    }        
                    break;
            
                default: 
                    if (sessionData.selection === "menucategories") {
                        switch (msg) {
                            case "breakfast":
                                sessionData.selection = "breakfast"
                                displayMenus(category.breakfast, sessionId, io);
                                break;
                            case "combos":
                                sessionData.selection = "combos"
                                displayMenus(category.combos, sessionId, io);   
                                break;
                            case "drinks":
                                sessionData.selection = "drinks"
                                displayMenus(category.drinks, sessionId, io);
                                break;
                            case "chops":
                                sessionData.selection = "chops"
                                displayMenus(category.chops, sessionId, io);
                                break;
                            case "varieties":
                                sessionData.selection = "varieties";
                                displayMenus(category.varieties, sessionId, io);
                                break;
                        
                            default:
                                io.to(sessionId).emit("bot_message", "invalid option! Please select one of the ones listed above");
                                break;
                        }
                    } else {
                        const selection = sessionData.selection;
                        const getCategory = category[selection];
                        
                        if (getCategory[msg]) {
                            const item = getCategory[msg];
                            order.push(item);
                            io.to(sessionId).emit("bot_message", `${item} has been added to your order!`);
                            io.to(sessionId).emit("bot_message", "Press 99 to checkout your order");
                            
                        } else {
                            io.to(sessionId).emit("bot_message", "please type one of the numbers listed above");
                        }
                                
                    }
                    break;
            }
           
        } 
    })

            socket.on("disconnect", () => {
                console.log("user disconnected"); 
            });

});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});