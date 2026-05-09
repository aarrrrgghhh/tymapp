const medicationDao = require("../../dao/medication-dao.js");
const Ajv = require("ajv");

const ajv = new Ajv();

const deleteSchema = {
  type: "object",
  properties: {
    medicationId: { type: "string", minLength: 1 }
  },
  required: ["medicationId"],
  additionalProperties: false
};

function DeleteAbl(req, res) {
  const dtoIn = req.body;

  const validate = ajv.compile(deleteSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const existing = medicationDao.get(dtoIn.medicationId);
  if (!existing) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }

  medicationDao.delete(dtoIn.medicationId);

  const dtoOut = {
    medicationId: dtoIn.medicationId,
    deleted: true
  };

  res.json(dtoOut);
}

module.exports = DeleteAbl;
