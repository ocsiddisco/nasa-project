const axios = require("axios");

const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

// hard coded during all the development process
// const launch = {
//   flightNumber: 100, // in spaceX API corresponds to flight_number
//   mission: "Kepler Exploration X", // name
//   rocket: "Explorer IS1", // rocket.name
//   launchDate: new Date("December 27, 2023"), // date_local
//   target: "Kepler-442 b", // not applicable
//   customers: ["NASA", "FAMILY"], // payloads.customers for each payload
//   upcoming: true, // upcoming
//   success: true, // success
// };
// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";

async function populateLaunches() {
  // take two arguments, first an url and second the data past in the body
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // pagination false allows us to ignore the pagination system storing the launches data and get all launches instead of just one page of launches
      pagination: false,
      populate: [
        { path: "rocket", select: { name: 1 } },
        { path: "payloads", select: { customers: 1 } },
      ],
    },
  });

  // checking the status code returned by spacex API
  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    // you can have several customers, the function below allows to create an array with the array of each customer
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    // populate DB with data from spaceX API
    await saveLaunch(launch);
  }
}

// launch data from spaceX API
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded.");
  } else {
    populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter);
}

// map through launches and search for the key matching the id(flighNumber)
async function existLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

// in SQL auto incrementation for each new row of a table. in mongo DB needs to be done differently
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDB.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    // if there is currently no launch in DB
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

// searches all document in launches collection in DB
// arguments skip and limit from the query
async function getAllLaunches(skip, limit) {
  // 1st argument, empty object to specify we want all the document of a specific collection
  // 2nd argument is to exclude id and v from the results
  return await launchesDB
    .find({}, { _id: 0, __V: 0 })

    // in mongo launches are not sorted by flight numbers, fixing it to get the history launch sorted properly on the front-end by ascending number
    .sort({ flightNumber: 1 })

    // skipping some documents to determine which  launches will be displayed in the page
    .skip(skip)

    // limit the number of documents received from the DB
    .limit(limit);
}

async function saveLaunch(launch) {
  // upsert again. see planets.model for explaination
  await launchesDB.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

// replace the addNewLaunch()
async function scheduleNewLaunch(launch) {
  // first checking is the planet exists in our DB, ONLY for the launch schedule from our front-end, not needed for spaceX api
  const planet = await planets.findOne({ keplerName: launch.target });
  if (!planet) {
    throw new Error("No matching planet was found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}
// old function before mongodb
// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customers: ["Family", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

// DELETE but keep data for the history section
async function abordLaunchById(launchId) {
  // const aborded = launches.get(launchId);
  // aborded.upcoming = false;
  // aborded.success = false;
  // return aborded;
  const aborted = await launchesDB.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abordLaunchById,
};
