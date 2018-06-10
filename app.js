import express from "express";
import bodyParser from "body-parser";
import request from "request";
import { MongoClient } from "mongodb";
import { connect } from "./db";
import config from "./config";
import querystring from "query-string";

var app = express();
let token =
  "EAADCkm8qQ8EBAIri8j0AMtCSOQpRprexNeivCZCRCsj3qWQ0u9k42sznrVPhoxvcf9WUKlBPmxYlZBRAMD2PkMRIG4lJFE5cjVlv8upgz0ZAw4dZA0hxn40lcyD1rEVXFToBknopP0pjxAIt6tTDAfQQl7xMIV0reUuKtznvPAZDZD";

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

app.post("/webhook", (req, res) => {
  let messaging = req.body.entry[0].messaging;
  let sendMsgTimeout;
  // console.log("sender: " + req.body.entry[0].messaging[0].sender.id);
  for (let i = 0; i < messaging.length; i++) {
    let sender = messaging[i].sender.id;
    //   "query": "remind me about breakfast at Dave place in 10 seconds",
    if (messaging[i].message && messaging[i].message.text) {
      let text = messaging[i].message.text;
      getLuisIntent(text).then(function(data) {
        var currentDate = new Date();
        var parsedData = JSON.parse(data);
        var luisDate = parsedData.entities[1].resolution.values[0].timex;
        let timer = Date.parse(luisDate) - currentDate.getTime();
        console.log(parsedData);
        console.log("---------------");
        console.log(parsedData.entities[1].resolution);
        console.log(timer);
        sendMsgTimeout = setTimeout(function() {
          sendText(sender, parsedData);
          console.log("tick");
        }, timer);
      });
    }
    if (messaging[0].postback && messaging[0].postback.payload === "done") {
      console.log("postback: " + messaging[0].postback.payload);
      sendText(sender, null, true);
    }
  }
  res.sendStatus(200);
});

function getLuisIntent(utterance) {
  var endpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";
  var luisAppId = "7ff73086-9a62-4e1b-ad7c-3f64fac48aaf";
  var queryParams = {
    "subscription-key": "0434d0a9bb834d3f9358a37ddd9e9708",
    timezoneOffset: "180",
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

function sendText(sender, json, paybackResp) {
  // console.log("text: " + text);
  // console.log("sender: " + sender);
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
                  title: paybackResp ? "Done!" : "Hi, here's your reminder:",
                  image_url:
                    "https://d1ro8r1rbfn3jf.cloudfront.net/ms_61397/LamNf1Y6jSk5uB5pSSiSfbCInh0rFk/pic.jpg?Expires=1528469721&Signature=n8LDHnkAKKcbpnuXF3edNq5XRXNlSvkYQ3U2u2MB5hRl4pjWF4fuhAx0qllu1xLpM8BmJGYS-pkhYllalWZviO7esT5ZQteaBxxPmfxYz5GUMaD-uWg0Q9yeTu2Qm6NWuMfCtTE3Gmbv40LZSAHQ7w1th-BZOynP~tdUvxTWFaqBaKnqODtExDH-8y77TqTzEci6Du61Hu28b9poROwaZlth6IUqrBVxEbGRoKM4aCVSUorD6loyD3LNNdN2LiBLTgPuszT7bq4Dvhd1rJ0R0TcLbaL6~FjK4kMnB9GBp39lU2Lkjrb6-Vum4MAZQuM4G3saeR2eZDY1wYzOtBazSQ__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA",
                  subtitle: paybackResp
                    ? "Good job, + 100 in karma!"
                    : "'" + json.entities[0].entity + "'" + " reminder",
                  buttons: paybackResp
                    ? null
                    : [
                        {
                          type: "postback",
                          title: "Done",
                          payload: "done"
                        }
                      ]
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

app.set("port", 3013);

connect(config.database.url, err => {
  if (err) {
    return console.log(err);
  }
  app.listen(app.get("port"), () => {
    console.log("API started!");
  });
});
