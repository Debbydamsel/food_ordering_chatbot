const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT || 3000;
const path = require("path");

const joinPath = path.join(__dirname, "bot.html");
const landingPage = path.join(__dirname, "landingpage.html");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//handle sessions
const sessionMiddleWare = session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true},
    store: new session.MemoryStore()
})


app.use(sessionMiddleWare);
app.use(bodyParser.urlencoded({extended: false}));

const categories = ["Please type in a category you want to select a food item from:", "breakfast", "combo dishes", "thirst quenchers", "chops", "varieties"];



app.get("/", (req, res) => {
    res.sendFile(landingPage);
})

app.get('/chatbot', (req, res) => {
  res.sendFile(joinPath);
});

//socket.io middleware used to store and retrieve sessions
io.use((socket, next) => {
    sessionMiddleWare(socket.request, socket.request.res, next);
});



io.on('connection', (socket) => {
  console.log('a user connected');
    //get the session id
    const sessionId = socket.request.session.id;

    //attach the user's socketid with the session object
    //this also stores the session id to the socket id
    socket.request.session.socketId = socket.id;

    //get the session which includes the socketid to connect the user to that session
    const sessionData = socket.request.session;

    socket.join(sessionId);

    let order = sessionData.order;
    let orderHistory = sessionData.orderHistory;
    order = [];
    orderHistory = [];

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
                        for (let i = 0; i < order.length; i++) {
                            orderHistory.push(order[i]);
                            // io.to(sessionId).emit("bot_message", order[i]);
                        }
                        io.to(sessionId).emit("bot_message", "Order placed!");
                        
                    }
                    break;
                case "98":
                    if (orderHistory.length === 0) {
                        io.to(sessionId).emit("bot_message", "No order has been placed yet so you dont have any order history!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {
                        for (let i = 0; i < orderHistory.length; i++) {
                            io.to(sessionId).emit("bot_message", orderHistory[i]);
                        }
                    }
                    break;
                case "97":
                    if (order.length === 0) {
                        io.to(sessionId).emit("bot_message", "No order has been placed yet!");
                        io.to(sessionId).emit("bot_message", "Press 1 to place an order");
                    } else {
                        for (let i = 0; i < orderHistory.length; i++) {
                        
                            io.to(sessionId).emit("bot_message", orderHistory[i]);
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
                                console.log(sessionData);
                                let breakfastMenu = {
                                    "1": "2. Akara and pap - #\800",
                                    "2": "3. Boiled or fried yam - #\6700",
                                    "3": "4. fried potato - #\6600"
                                }
                                Object.values(breakfastMenu).forEach(value => io.to(sessionId).emit("bot_message", value));
                                io.to(sessionId).emit("bot_message", "Type 1 to go back to the food categories");
                                break;
                            case "combo dishes":
                                sessionData.selection = "combo dishes"
                                let comboMenu = {
                                    "1": "2. Eba and egusi - #\800",
                                    "2": "3. Yam and egg - #\6700",
                                    "3": "4. Bread and ewa agoyin - #\78800"
                                }
                                Object.values(comboMenu).forEach(value => io.to(sessionId).emit("bot_message", value));
                                console.log(sessionData);
                                io.to(sessionId).emit("bot_message", "Type 1 to go back to the food categories");
                                
                                break;
                            case "thirst quenchers":
                                sessionData.selection = "thirst quenchers"
                                let quenchMenu = {
                                    "1": "2. 5alive pulpy - #\800",
                                    "2": "3. Chapman - #\6600",
                                    "3": "4. Parfait - #\78800"
                                }
                                Object.values(quenchMenu).forEach(value => io.to(sessionId).emit("bot_message", value));
                                io.to(sessionId).emit("bot_message", "Type 1 to go back to the food categories");
                                
                                
                                break;
                            case "chops":
                                sessionData.selection = "chops"
                                let chopsMenu = {
                                    "1": "2. Chicken pie - #\800",
                                    "2": "3. Meat pie - #\6600",
                                    "3": "4. Scotch egg - #\722200"
                                }
                                Object.values(chopsMenu).forEach(value => io.to(sessionId).emit("bot_message", value));
                                io.to(sessionId).emit("bot_message", "Type 1 to go back to the food categories");
                                
                                
                                break;
                            case "varieties":
                                sessionData.selection = "varieties";
                                let varietiesMenu = {
                                    "1": "2. Asun - #\10000",
                                    "2": "3.  pepper soup - #\703000",
                                    "3": "4. Nkwobi - #\6600"
                                }
                                Object.values(varietiesMenu).forEach(value => io.to(sessionId).emit("bot_message", value));
                                io.to(sessionId).emit("bot_message", "Type 1 to go back to the food categories");
                                
                                
                                break;
                        
                            default:
                                io.to(sessionId).emit("bot_message", "invalid option! Please select one of the ones listed above");
                                break;
                        }
                    } else {
                        const selection = sessionData.selection;
                        switch (selection) {
                            case "breakfast":
                                switch(msg) {
                                    case "2":
                                        order.push("Akara and pap - #\800");
                                        io.to(sessionId).emit("bot_message", "Akara and pap - #\800 added to your order");
                                        break;
                                    case "3":
                                        order.push("Boiled or fried yam - #\6700");
                                        io.to(sessionId).emit("bot_message", "Boiled or fried yam - #\6700 added to your order");
                                        break;
                                    case "4":
                                        order.push("fried potato - #\6600");
                                        io.to(sessionId).emit("bot_message", "fried potato - #\6600 added to your order");
                                        break;
                                    default:
                                        io.to(sessionId).emit("bot_message", "Enter the number attached to the food menu");
                                        break;
                                }
                                break;
                            case "combo dishes":
                                switch(msg) {
                                    case "2":
                                        order.push("Eba and egusi - #\800");
                                        io.to(sessionId).emit("bot_message", "Eba and egusi - #\800 added to your order");
                                        break;
                                    case "3":
                                        order.push("Yam and egg - #\700");
                                        io.to(sessionId).emit("bot_message", "Yam and egg - #\700 added to your order");
                                        break;
                                    case "4":
                                        order.push("Bread and ewa agoyin - #\8800");
                                        io.to(sessionId).emit("bot_message", "Bread and ewa agoyin - #\8800 added to your order");
                                        break;
                                    default:
                                        io.to(sessionId).emit("bot_message", "Enter the number attached to the food menu");
                                        break;
                                }
                                break;
                            case "thirst quenchers":
                                
                                switch(msg) {
                                    case "2":
                                        order.push("5alive pulpy - #\800");
                                        io.to(sessionId).emit("bot_message", "5alive pulpy - #\800 added!");
                                            break;
                                    case "3":
                                        order.push("Chapman - #\6600");
                                        io.to(sessionId).emit("bot_message", "Chapman - #\6600 added!");
                                            break;
                                    case "4":
                                        order.push("Parfait - #\78800");
                                        io.to(sessionId).emit("bot_message", "Parfait - #\78800 added");
                                            break;
                                        default:
                                            io.to(sessionId).emit("bot_message", "Enter the number attached to the food menu");
                                            break;
                                    }
                                break;
                            case "chops":
                                switch(msg) {
                                    
                                    case "2":
                                        order.push("Chicken pie - #\800");
                                        io.to(sessionId).emit("bot_message", "Chicken pie - #\800 added!");
                                            break;
                                    case "3":
                                        order.push("Meat pie - #\6600");
                                        io.to(sessionId).emit("bot_message", "Meat pie - #\6600 added!");
                                            break;
                                    case "4":
                                        order.push("Scotch egg - #\722200");
                                        io.to(sessionId).emit("bot_message", "Scotch egg - #\722200 added!");
                                            break;
                                        default:
                                            io.to(sessionId).emit("bot_message", "Enter the number attached to the food menu");
                                            break;
                                    }
                                break;
                                case "varieties":
                                    
                                    switch(msg) {
                                        case "2":
                                            order.push("Asun - #\10000");
                                            io.to(sessionId).emit("bot_message", "Asun - #\10000 added!");
                                            break;
                                        case "3":
                                            order.push("pepper soup - #\703000");
                                            io.to(sessionId).emit("bot_message", "pepper soup - #\703000 added!");
                                            break;
                                        case "4":
                                            order.push("Nkwobi - #\6600");
                                            io.to(sessionId).emit("bot_message", "Nkwobi - #\6600 added");
                                            break;
                                        default:
                                            io.to(sessionId).emit("bot_message", "Enter the number attached to the food menu");
                                            break;
                                    }
                        
                            default:
                                io.to(sessionId).emit("bot_message", "Type in one of the numbers above to make your request!");
                                break;
                        }
                    }
                
                
                    break;
           }
           
        } 
        })

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
 });

server.listen(port, () => {
    console.log(`listening on *:${port}`);
  });


