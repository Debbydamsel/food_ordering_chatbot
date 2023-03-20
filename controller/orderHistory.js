const OrderHistory = require("../model/orderHistoryModel");
const {loopHandler} = require("../controller/categories");

function placeOrder(userId, order, sessionId, io) {

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
}

function getOrders(userId, sessionId, io) {
    OrderHistory.find({userId}, { _id: 0, items: 1 }).lean()
    .then((orders) => {
        if(orders) {
            const previousOrders = orders.map(order => Object.values(order).join(", "));
            loopHandler(previousOrders, sessionId, io);
        } else {
            io.to(sessionId).emit("bot_message", "Your do not have an order history");
            io.to(sessionId).emit("bot_message", "Press 1 to place an order");
        }
    })
    .catch((err) => {
        console.log(err);
    })  
}



module.exports = { placeOrder, getOrders };