const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      // pipe: connect readable stream source to a readable stream destination
      // comment: # we are telling to treat lines that start with this character as comments
      // columns: true, will return each row as a JS object, with key-value pairs, rather than an array
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

async function savePlanet(planet) {
  // insert + update = upsert.
  // first argument, is a query to find all the planets with a name matching the current planet, so we are sure to insert a planet that does not already exist.
  // second argument, if planet already exists, it will only be updated
  // third argument, upsert. will only add planet if does not exist
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.log(`could not save planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

//here the const is exported before being populated- using a promise here will allow us to get the data while loading(will be resolved when data has been found)
