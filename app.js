const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

let port = process.env.PORT || 3000;

const url = "mongodb+srv://paznah123:p0cketk1ng@fruitsdb.s3c6u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const day = date.getDate();

/* ========================== */

mongoose.connect(url, {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const defaultItems = [
    new Item({ name: 'Welcome to your todo list!' }),
    new Item({ name: 'Hit the + button to add a new item.' }),
    new Item({ name: '<-- Hit this to delete an item.' })
];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

/* ========================== */

app.get("/", (req, res) => {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) console.log(err);
                else console.log("Successfully added items to db!");
            });
            res.redirect('/');
        } else
            res.render('list', { listTitle: day, newListItems: foundItems });
    });

});


app.get("/about", (req, res) => {
    res.render("about");
});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            } else
                res.render('list', { listTitle: foundList.name, newListItems: foundList.items })
        }
    });
    
});

/* ========================== */

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === day) {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+ listName);
        });
    }
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) console.log("Successfully deleted item from db!");
        });
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } },
            (err, foundList) => { if (!err) res.redirect('/' + listName);  }
        );
    }
});

app.listen(port, () => {
    console.log("Server started successfuly on port: " + port);
});