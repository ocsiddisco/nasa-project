const http = require("http");
require("dotenv").config();

const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData } = require("./models/planets.model");

// will allow us to load the launches data from spaceXapi
const { loadLaunchData } = require("./models/launches.model");

const app = require("./app");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  // connect to server before starting app -> data available to handle requests users

  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
  });
}

startServer();
