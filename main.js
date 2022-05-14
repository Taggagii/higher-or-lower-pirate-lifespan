const { prototype } = require("events");
const express = require("express");
const PORT = 8000;
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();

// allowing for the frontend to pass information to the backend
// initalizing socket.io's connect to the application
const httpServer = createServer(app);
const io = new Server(httpServer, {});


io.on("connection", (socket) => {
    socket.on("choice_question", (choice) => {
        console.log(`client made choice :`);
        console.log(choice);

        let correct = false;
        let age = 50;
        io.emit("choice_response", {correct: correct, age: age});
    });

});




// telling the express module that the public dir has all of our site assests
app.use(express.static(__dirname + "/public"));


// this creates an endpoint on the website for "/" 
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});





// this starts hosting the webpage on the given port
httpServer.listen(PORT);


