

let category = {
    breakfast: {
        2: "2. Akara and pap - #\800",
        3: "3. Boiled or fried yam - #\6700",
        4: "4. fried potato - #\6600"
    },

    combos: {
        2: "2. Eba and egusi - #\800",
        3: "3. Yam and egg - #\6700",
        4: "4. Bread and ewa agoyin - #\78800"
    }, 

    drinks: {
        "1": "2. 5alive pulpy - #\800",
        "2": "3. Chapman - #\6600",
        "3": "4. Parfait - #\78800"
    },

    chops: {
        "1": "2. Chicken pie - #\800",
        "2": "3. Meat pie - #\6600",
        "3": "4. Scotch egg - #\722200"
    },

    varieties: {
        "1": "2. Asun - #\10000",
        "2": "3.  pepper soup - #\703000",
        "3": "4. Nkwobi - #\6600"
    }
}

function displayMenus(pickCategory, sessionId, io) {
    Object.values(pickCategory).forEach(value => io.to(sessionId).emit("bot_message", value));
    io.to(sessionId).emit("bot_message", "when you are done with ordering from this category, Type 1 to go back to the food categories if you would like to order more");
}

module.exports = {category, displayMenus};