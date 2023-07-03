const express = require("express");

const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

const api = express.Router();

api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;

// versioning: grouping together all the routes in an api under a certain path and keeping all the version
// of the routes around after added a new version(allow user the time to move to new version)
