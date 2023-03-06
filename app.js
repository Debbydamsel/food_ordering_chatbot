const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({extended: false}));




app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})

