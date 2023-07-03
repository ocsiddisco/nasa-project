const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbordLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:id", httpAbordLaunch);

module.exports = launchesRouter;
