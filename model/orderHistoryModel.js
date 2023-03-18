const mongoose = require("mongoose");
const orderSchema = mongoose.Schema;

const orderModel = new orderSchema({

    userId: {type: String},
    items: {type: [String]}
})

module.exports = mongoose.model("orderHistory", orderModel);