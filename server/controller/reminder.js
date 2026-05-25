const createAbl = require("../abl/reminder/createAbl.js");
const updateAbl = require("../abl/reminder/updateAbl.js");
const deleteAbl = require("../abl/reminder/deleteAbl.js");
const listFromTodayAbl = require("../abl/reminder/listFromTodayAbl.js");
const listByMedicationIdAbl = require("../abl/reminder/listByMedicationIdAbl.js");

module.exports = {
  create: (req, res) => createAbl(req, res),
  update: (req, res) => updateAbl(req, res),
  delete: (req, res) => deleteAbl(req, res),
  listFromToday: (req, res) => listFromTodayAbl(req, res),
  listByMedicationId: (req, res) =>
  listByMedicationIdAbl(req, res)
};