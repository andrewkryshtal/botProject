import { MongoClient } from "mongodb";

var state = {
  db: null
};

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
