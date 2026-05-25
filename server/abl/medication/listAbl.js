const medicationDao = require("../../dao/medication-dao.js");

async function ListAbl(req, res) {
  const medicationList = await medicationDao.list();

  res.json({ medicationList });
}

module.exports = ListAbl;