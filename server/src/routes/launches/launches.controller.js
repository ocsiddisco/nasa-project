const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchWithId,
  abordLaunchById,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  console.log(req.query);
  // using the query to obtain skip and limit
  const { skip, limit } = getPagination(req.query);

  // controller manipulates data into a format that works for the api, then transforms it into json to return it to the front end
  // passing parameters skip and limit to send this info to the DB
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({ error: "Missing required launch property" });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbordLaunch(req, res) {
  const launchId = Number(req.params.id);

  const existLaunch = await existLaunchWithId(launchId);
  // if launch does not exsit
  if (!existLaunch)
    return res.status(404).json({
      error: "Launch not found",
    });

  // if launch does exist
  const aborted = await abordLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbordLaunch };
