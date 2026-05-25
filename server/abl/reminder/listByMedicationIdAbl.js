const reminderDao = require("../../dao/reminder-dao.js");
const Ajv = require("ajv");

const ajv = new Ajv();

const listByMedicationIdSchema = {
  type: "object",
  properties: {
    medicationId: { type: "string", minLength: 1 }
  },
  required: ["medicationId"],
  additionalProperties: false
};

function ListByMedicationIdAbl(req, res) {
  const dtoIn = req.query;
  
  const validate = ajv.compile(listByMedicationIdSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const dtoOut = reminderDao.listByMedicationId(dtoIn.medicationId);

  res.json(dtoOut);
}

module.exports = ListByMedicationIdAbl;