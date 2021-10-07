const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();

let items = [];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ========================== */

app.get("/", (req, res) => {
    let day = date.getDate();
    res.render('list', { listTitle: day, newListItems: items });
});

app.get("/work", (req, res) => {
    res.render('list', { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", (req, res) => {
    res.render("about");
});

/* ========================== */

app.post("/", (req, res) => {
    let item = req.body.newItem;
    let arr = null;
    let route = "";
    if (req.body.list === "Work") {
        arr = workItems;
        route = "/work";
    } else {
        arr = items; 
        route = "/";
    }
    arr.push(item);
    res.redirect(route);
});

app.listen(3000, () => {
    console.log("server running on port 3000");
});