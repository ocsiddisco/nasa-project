const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

// Mongoose connection is an event emitter that emits events when the connection is ready and things have succeeded or when there is error.
// .once: feater node.js to trigger the function only the first time it's executed.

mongoose.connection.once("open", () => {
  console.log("MongoDb connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };
