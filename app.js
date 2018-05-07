import express from "express";
import bodyParser from "body-parser";
import { request } from "https";
const MongoClient = require("mongodb").MongoClient;
const db = require("./db");

var app = express();
let token =
  "EAAGU3SViOvEBAEBaZAKfLWZBZAwf7Bjvl9MyK7T7pXZAzCoOs94ByIBrdoCjLqZCFZB9K4azLAAOcpTt2kU4truNcL0xaeEOokohao6gtuX1Jm3eMVYZCsxl55MGzfOYeTpnMT9qQIOajcdUSSUfb3iZAZC1oLSWol0j6XYnIYz83uAZDZD";
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
  let messaging_events = req.body.entry[0].messaging_events;
  for (let i = 0; i, messaging_events.length; i++) {
    let event = messaging_events[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      let text = event.message.text;
      sendText(sender, "text echo: " + text.substring(0, 100));
    }
  }
  res.sendStatus(200);
});

function sendText(sender, text) {
  let messageData = { text: text };
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: token },
      method: "POST",
      json: {
        recipient: { id: sender },
        message: messageData
      }
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else if (response.body.error) {
        console.log(response.body.error);
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
