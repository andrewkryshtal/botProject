import express from "express";
import path from "path";
import bodyParser from "body-parser";
import request from "request";
import { MongoClient } from "mongodb";
import { connect } from "./db";
// import { luisIntent } from "./luis";
import config from "./config";
import querystring from "query-string";

var app = express();
let token =
  "EAADCkm8qQ8EBAIri8j0AMtCSOQpRprexNeivCZCRCsj3qWQ0u9k42sznrVPhoxvcf9WUKlBPmxYlZBRAMD2PkMRIG4lJFE5cjVlv8upgz0ZAw4dZA0hxn40lcyD1rEVXFToBknopP0pjxAIt6tTDAfQQl7xMIV0reUuKtznvPAZDZD";
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("938470555");
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
  // console.log("text: " + text);
  // console.log("sender: " + sender);
  getLuisIntent(text);
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + token,
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      json: {
        recipient: {
          id: sender
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [
                {
                  title: "Welcome!",
                  image_url:
                    "https://d1ro8r1rbfn3jf.cloudfront.net/ms_61397/LamNf1Y6jSk5uB5pSSiSfbCInh0rFk/pic.jpg?Expires=1528469721&Signature=n8LDHnkAKKcbpnuXF3edNq5XRXNlSvkYQ3U2u2MB5hRl4pjWF4fuhAx0qllu1xLpM8BmJGYS-pkhYllalWZviO7esT5ZQteaBxxPmfxYz5GUMaD-uWg0Q9yeTu2Qm6NWuMfCtTE3Gmbv40LZSAHQ7w1th-BZOynP~tdUvxTWFaqBaKnqODtExDH-8y77TqTzEci6Du61Hu28b9poROwaZlth6IUqrBVxEbGRoKM4aCVSUorD6loyD3LNNdN2LiBLTgPuszT7bq4Dvhd1rJ0R0TcLbaL6~FjK4kMnB9GBp39lU2Lkjrb6-Vum4MAZQuM4G3saeR2eZDY1wYzOtBazSQ__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA",
                  subtitle: "We have the right hat for everyone."
                  // buttons: [
                  //   {
                  //     type: "postback",
                  //     title: "Start Chatting",
                  //     payload: "test"
                  //   }
                  // ]
                }
              ]
            }
          }
        }
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

function getLuisIntent(utterance) {
  var endpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
  var luisAppId = "7ff73086-9a62-4e1b-ad7c-3f64fac48aaf";
  var queryParams = {
    "subscription-key": "0434d0a9bb834d3f9358a37ddd9e9708",
    timezoneOffset: "1",
    verbose: true,
    q: utterance
  };

  var luisRequest =
    endpoint + luisAppId + "?" + querystring.stringify(queryParams);

  return new Promise(function(resolve, reject) {
    request(luisRequest, function(err, response, body) {
      if (err) console.log(err);
      else {
        var data = JSON.parse(body);

        resolve(JSON.stringify(data));
      }
    });
  });
}

app.post("/webhook", (req, res) => {
  let messaging = req.body.entry[0].messaging;
  console.log(typeof req.body);
  // console.log("sender: " + req.body.entry[0].messaging[0].sender.id);
  for (let i = 0; i < messaging.length; i++) {
    let sender = messaging[i].sender.id;
    if (messaging[i].message && messaging[i].message.text) {
      let text = messaging[i].message.text;
      getLuisIntent(text).then(function(data) {
        var currentDate = new Date();
        console.log(currentDate);
        console.log(JSON.parse(data));
        // sendText(sender, data);
      });
    }
    if (messaging[0].postback && messaging[0].postback.payload === "test") {
      console.log("postback: " + messaging[0].postback.payload);
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
