import express from "express";
import bodyParser from "body-parser";
import request from "request";
import { MongoClient } from "mongodb";
// const db = require("./db");
import { connect } from "./db";
import config from "./config";

var app = express();
let token =
  "EAADCkm8qQ8EBAIri8j0AMtCSOQpRprexNeivCZCRCsj3qWQ0u9k42sznrVPhoxvcf9WUKlBPmxYlZBRAMD2PkMRIG4lJFE5cjVlv8upgz0ZAw4dZA0hxn40lcyD1rEVXFToBknopP0pjxAIt6tTDAfQQl7xMIV0reUuKtznvPAZDZD";
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("hello world!");
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Facebook token check

app.get("/webhook", (req, res) => {
  //   console.log(res);
  console.log(req.query["hub.verify_token"]);
  if (req.query["hub.verify_token"] === "rand") {
    res.send(req.query["hub.challenge"]);
  }
  res.send("wrong token");
});

function sendText(sender, text) {
  console.log("text: " + text);
  console.log("sender: " + sender);
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + token,
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      json: {
        messaging_type: "RESPONSE",
        recipient: { id: sender },
        message: { text: text }
      }
    },
    (error, response, body) => {
      if (error) {
        console.log("sending error");
      } else if (response.body.error) {
        console.log(response.body.error);
      }
    }
  );
}

app.post("/webhook", (req, res) => {
  let messaging = req.body.entry[0].messaging;
  console.log("sender: " + req.body.entry[0].messaging[0].sender.id);
  for (let i = 0; i < messaging.length; i++) {
    let sender = messaging[i].sender.id;
    if (messaging[i].message && messaging[i].message.text) {
      let text = messaging[i].message.text;
      sendText(sender, "text echo: " + text.substring(0, 100));
    }
  }
  res.sendStatus(200);
});

app.set("port", 3013);

connect(config.database.url, err => {
  if (err) {
    return console.log(err);
  }
  app.listen(app.get("port"), () => {
    console.log("API started!");
  });
});
