import * as MongoClient from "mongodb";

var state = {
  db: null
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
var connect = (url, done) => {
  if (state.db) {
    return done();
  }
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return done(err);
    }
    state.db = db.db("botapi");
    console.log("test");
    done();
  });
};

var get = () => {
  return state.db;
};

export { connect, get };
