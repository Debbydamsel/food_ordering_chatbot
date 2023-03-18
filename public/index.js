var socket = io();
        let input = document.getElementById("input");
        let chats = document.getElementById("msg-area")
        

        document.getElementById("go").addEventListener("click", (e) => {
            e.preventDefault();
            if (input.value) {

                socket.emit("user_input", input.value);
                
                input.value = "";
                input.focus();
            }
            
        })

        socket.on("bot_message", function(msg) {
            let reply = document.createElement("div");
            reply.setAttribute("class", "left");
            reply.innerHTML = msg;
            document.getElementById("msg-area").appendChild(reply);
            chats.scrollTop = chats.scrollHeight;
        })

        socket.on("user_message", function(msg) {
            let botreply = document.createElement("div");
            botreply.setAttribute("class", "right");
            botreply.innerHTML = msg;
            document.getElementById("msg-area").appendChild(botreply);
            chats.scrollTop = chats.scrollHeight;
        })

      


