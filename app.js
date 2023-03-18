const express = require("express");
const dbConnect = require("./dbConnection/connectToDb");
const OrderHistory = require("./model/orderHistoryModel");
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
const {category, displayMenus} = require("./controller/categories");

//connection to mongodb
dbConnect();


app.use(express.static(joinPath));
app.use(sessionMiddleWare);
app.use(bodyParser.urlencoded({extended: false}));


//socket.io middleware used to store and retrieve sessions
io.use((socket, next) => {
    sessionMiddleWare(socket.request, socket.request.res, next);
});


const categories = ["Please type in a category you want to select a food item from:", "breakfast", "combos", "drinks", "chops", "varieties"];



io.on("connection", (socket) => {
    console.log("user connected");
    
    //get the session id
    const sessionId = socket.request.session.id;
    

    //attach the user's socketid with the session object
    //this also stores the session id to the socket id
    socket.request.session.socketId = socket.id;

    //get the session which includes the socketid to connect the user to that session
    const sessionData = socket.request.session;


     //if the user id does not already exists create a new one 
     if (!socket.request.session.userId) {
        //generate a unique userid
        const userId = uuid.v4();
        //join the userid to the session
        socket.request.session.userId = userId;
        socket.request.session.save();
    }

    //if the userid already exist just use that id for the socket connection
    const userId = socket.request.session.userId;

    socket.join(sessionId);

    let order = sessionData.order;
    order = [];

    sessionData.save();

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
                    console.log(sessionData);
                    for (let i = 0; i < categories.length; i++) {
                        io.to(sessionId).emit("bot_message", categories[i]);
                    }
                    break;
                case "99":
                    if (order.length === 0) {
                        io.to(sessionId).emit("bot_message", "No order to place yet!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {

                        const ordersHistory = new OrderHistory({
                            userId: userId,
                            items: order
                        })

                        ordersHistory.save();
                       
                        io.to(sessionId).emit("bot_message", "Order placed!<br> Press 1 to place new orders");
                        order.length = 0;
                        
                    }
                    break;
                case "98":

                     OrderHistory.find({userId}, { _id: 0, items: 1 }).lean()
                     .then((orders) => {
                       const previousOrders = orders.map(order => Object.values(order).join(", "));
                        

                        for (let i = 0; i < previousOrders.length; i++) {
                            io.to(sessionId).emit("bot_message",eachitems[i]);
                        }
                     }).catch((err) => {
                        console.log(err);
                     })
                    
                    break;
                case "97":

                   
                    if (order.length === 0) {
                        io.to(sessionId).emit("bot_message", "No order has been placed yet!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {
                        for (let i = 0; i < order.length; i++) {
                            io.to(sessionId).emit("bot_message", `Here is your current order <br> ${order[i]}`);
                        }
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
                        console.log(selection);
                        const getCategory = category[selection];
                        console.log(getCategory);
                        
                        if (getCategory[msg]) {
                            const item = getCategory[msg];
                            order.push(item);
                            io.to(sessionId).emit("bot_message", `${item} added to your order`);
                            
                        } else {
                            io.to(sessionId).emit("bot_message", "please select one of the items listed above");
                            displayMenus(category, sessionId, io);
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


