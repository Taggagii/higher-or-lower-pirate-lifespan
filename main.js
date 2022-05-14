const { prototype } = require("events");
const express = require("express");
const PORT = 8000;
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const fs = require("fs");
const { get } = require("express/lib/response");

app.set("view engine", "ejs");

// telling the express module that the public dir has all of our site assests
app.use(express.static(__dirname + "/public"));


// allowing for the frontend to pass information to the backend
// initalizing socket.io's connect to the application
const httpServer = createServer(app);
const io = new Server(httpServer, {});

var data = JSON.parse(fs.readFileSync("data.json"));

function check_correctness(choice) {
    // error handling
    if (!data[choice.left] && data[choice.right]) {
        return {"correct": true, "age": data[choice.right].age};
    } else if (!data[choice.right]) {
        return {"correct": true, "age": "unknown"};
    }

    let age_two = data[choice.right].age;
    let age_one = data[choice.left].age;

    if (choice.more) {
        return {"correct": age_two > age_one, "age": age_two};
    } else {
        return {"correct": age_two < age_one, "age": age_two};
    }
}

function get_random_person(given) {
    let keyArray = Object.keys(data);
    let value;
    do {
        value = keyArray[Math.floor(Math.random() * keyArray.length)];
    } while (value == given || data[value]["pic-link"] == "");

    return value;
    
}

io.on("connection", (socket) => {
    socket.on("choice_question", (choice) => {
        io.emit("choice_response", check_correctness(choice));
    });

    socket.on("page_opening", () => {
        
        let left_person = get_random_person();
        let right_person = get_random_person(left_person);
        io.emit("page_opening", {"left": {"name": left_person, "age": data[left_person]["age"]}, 
                                 "right": right_person,
                                 "image": {"left": data[left_person]["pic-link"], "right": data[right_person]["pic-link"]}});
    });

    socket.on("update_page", (previous_value) => {
        // error checking
        let new_person = get_random_person(previous_value.right);
        if (!data[previous_value.right]) {
            io.emit("update_page", {"left": {"name": previous_value.right, "age": "unknown"},
                                    "right": new_person});
        } else {
            io.emit("update_page", {"left": {"name": previous_value.right, "age": data[previous_value.right]["age"]},
                                    "right": new_person, 
                                    "image": {"left": data[previous_value.right]["pic-link"], "right": data[new_person]["pic-link"]}});
        }
        
    });
});






// this creates an endpoint on the website for "/" 
app.get("/", (req, res) => {``
    res.sendFile(path.join(__dirname, "/index.html"));
});



// this starts hosting the webpage on the given port
httpServer.listen(PORT);


