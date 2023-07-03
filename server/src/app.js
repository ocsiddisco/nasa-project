const path = require("path");
const morgan = require("morgan");

const api = require("./routes/api");

// using an app.js folder to store the express function allows to separate the milderware function from the server functions
const express = require("express");
// cors : protection website from being called from others. the npm package cors will help enable cors for various option
// we apply it here as it will be used for the 4 requests from the front end
const cors = require("cors");

const app = express();

// set origin site we want to allow access to our back
// differente clients/difference origine? possibility to conif cors for a dynamic origin(create white list)
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(morgan("combined"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", api);

// /*: after the get end point, will match everything following the slash, (match any end point not mentionned above)
// when it find a route not matching one of the above ones, it passes it on to react app via index.html
// this allows React (front-end) to roading instead
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
