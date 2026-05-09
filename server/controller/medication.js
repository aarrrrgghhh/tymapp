const createAbl = require("../abl/medication/createAbl.js");
const listAbl = require("../abl/medication/listAbl.js");
const updateAbl = require("../abl/medication/updateAbl.js");
const deleteAbl = require("../abl/medication/deleteAbl.js");

module.exports = {
  create: (req, res) => createAbl(req, res),
  list: (req, res) => listAbl(req, res),
  update: (req, res) => updateAbl(req, res),
  delete: (req, res) => deleteAbl(req, res)
};
