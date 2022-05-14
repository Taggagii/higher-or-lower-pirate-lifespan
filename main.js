const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");

// telling the express module that the public dir has all of our site assests
app.use(express.static(__dirname + "/public"));


// this creates an endpoint on the website for "/" 
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});





// this starts hosting the webpage on the given port
app.listen(PORT, () => {
    console.log(`App started on: localhost:${PORT}`);
});


