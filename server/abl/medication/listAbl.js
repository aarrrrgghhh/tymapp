const medicationDao = require("../../dao/medication-dao.js");

async function ListAbl(req, res) {
  const stored = medicationDao.list();

  const medicationList = stored.medicationList.map(m => ({
    medicationId: m.medicationId,
    brandName: m.brandName,
    genericName: m.genericName,
    dosageStrengthValue: m.dosageStrengthValue,
    dosageStrengthUnit: m.dosageStrengthUnit
  }));

  res.json({ medicationList });
}

module.exports = ListAbl;
