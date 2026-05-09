const reminderDao = require("../../dao/reminder-dao.js");
const medicationDao = require("../../dao/medication-dao.js");
const Ajv = require("ajv");
const crypto = require("crypto");

const ajv = new Ajv();

const reminderCreateSchema = {
  type: "object",
  properties: {
    medicationId: { type: "string", minLength: 1, maxLength: 100 },
    scheduledDateTime: { type: "string", format: "date-time" },
    calculatedPills: { type: "number", minimum: 0.0, maximum: 10000 }
  },
  required: ["medicationId", "scheduledDateTime", "calculatedPills"],
  additionalProperties: false
};

function CreateAbl(req, res) {
  const dtoIn = req.body;

  const validate = ajv.compile(reminderCreateSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const medication = medicationDao.get(dtoIn.medicationId);
  if (!medication) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }

  const reminder = {
    notificationId: "rem-" + crypto.randomUUID(),
    medicationId: dtoIn.medicationId,
    scheduledDateTime: dtoIn.scheduledDateTime,
    status: "UPCOMING",
    calculatedPills: dtoIn.calculatedPills
  };

  reminderDao.create(reminder);

  res.json({ reminder });
}

module.exports = CreateAbl;
