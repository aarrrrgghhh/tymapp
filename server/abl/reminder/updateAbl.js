const reminderDao = require("../../dao/reminder-dao.js");
const Ajv = require("ajv");

const ajv = new Ajv();

const reminderUpdateSchema = {
  type: "object",
  properties: {
    notificationId: { type: "string", minLength: 1, maxLength: 100 },
    status: { type: "string", enum: ["UPCOMING", "TAKEN", "MISSED"] }
  },
  required: ["notificationId", "status"],
  additionalProperties: false
};

function UpdateAbl(req, res) {
  const dtoIn = req.body;

  const validate = ajv.compile(reminderUpdateSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const existing = reminderDao.get(dtoIn.notificationId);
  if (!existing) {
    res.status(404).json({ error: "Reminder not found" });
    return;
  }

  const updatedReminder = {
    ...existing,
    status: dtoIn.status
  };

  reminderDao.update(updatedReminder);

  res.json({ reminder: updatedReminder });
}

module.exports = UpdateAbl;
