const medicationDao = require("../../dao/medication-dao.js");

async function ListAbl(req, res) {
  const stored = await medicationDao.list();   // FIXED: await + correct type

  const medicationList = stored.map(m => ({    // FIXED: stored is an array
    medicationId: m.medicationId,
    brandName: m.brandName,
    genericName: m.genericName,
    dosageStrengthValue: m.dosageStrengthValue,
    dosageStrengthUnit: m.dosageStrengthUnit
  }));

  res.json({ medicationList });
}

module.exports = ListAbl;
