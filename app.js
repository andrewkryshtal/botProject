import express from "express";
import bodyParser from "body-parser";
import { request } from "https";
const MongoClient = require("mongodb").MongoClient;
const db = require("./db");

var app = express();
let token =
  "EAAGU3SViOvEBAHwZAFThb4ZADpK2arHgBFrqCLSXs3T3yG3bpxO8PwfqfSTG3ItN1iANEzZC8XYFeOVXciELf2UZAUjqaKNRe5rD3QNlFpgZCCBLAdUDBgUE4Rk8S2WBb0AmA28gCETHWqmp2ZAfLEpBDupXVGfZBU6jdgW8ZCJDagZDZD";
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

app.post("/webhook", (req, res) => {
  //   console.log(req.body.entry);
  let messaging = req.body.entry[0].messaging;
  console.log("text message: " + req.body.entry[0].messaging[0].message.text);
  console.log("sender: " + req.body.entry[0].messaging[0].sender.id);

  console.log(JSON.stringify(req.body.entry[0].messaging[0].sender.id));
  for (let i = 0; i < messaging.length; i++) {
    let sender = JSON.stringify(messaging[i].sender.id);
    if (messaging[i].message && messaging[i].message.text) {
      let text = messaging[i].message.text;
      //   sendText(sender, "text echo: " + text.substring(0, 100));
      console.log("text in for cycle: " + text);
    }
  }
  res.sendStatus(200);
});

function sendText(sender, text) {
  let messageData = { text: text };
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + token,
      method: "POST",
      json: {
        messaging_type: "RESPONSE",
        recipient: { id: sender },
        message: messageData
      }
    },
    (error, response, body) => {
      if (error) {
        console.log("sending error");
      } else if (response.body.error) {
        console.log("response body error");
      }
    }
  );
}

app.set("port", 3013);

db.connect("mongodb://127.0.0.1:27017/botapi", err => {
  if (err) {
    return console.log(err);
  }
  app.listen(app.get("port"), () => {
    console.log("API started!");
  });
});
