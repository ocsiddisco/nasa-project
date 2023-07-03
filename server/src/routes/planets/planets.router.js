const express = require("express");

// const planetsController = require("./planets.controller");
// by destructuring we make it more clear which function we are using
const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = express.Router();

planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
