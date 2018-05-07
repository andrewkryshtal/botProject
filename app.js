import express from "express";
import bodyParser from "body-parser";
const MongoClient = require("mongodb").MongoClient;
const db = require("./db");

var app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.set("port", 3013);

db.connect("mongodb://127.0.0.1:27017/botapi", err => {
  if (err) {
    return console.log(err);
  }
  app.listen(app.get("port"), () => {
    console.log("API started!");
  });
});
