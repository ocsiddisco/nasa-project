const { getAllPlanets } = require("../../models/planets.model");

async function httpGetAllPlanets(req, res) {
  //status code is here optionnal as expres returns it by default
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets,
};
