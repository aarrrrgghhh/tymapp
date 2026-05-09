const reminderDao = require("../../dao/reminder-dao.js");
const Ajv = require("ajv");

const ajv = new Ajv();

const reminderDeleteSchema = {
  type: "object",
  properties: {
    notificationId: { type: "string", minLength: 1, maxLength: 100 }
  },
  required: ["notificationId"],
  additionalProperties: false
};

function DeleteAbl(req, res) {
  const dtoIn = req.body;

  const validate = ajv.compile(reminderDeleteSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const existing = reminderDao.get(dtoIn.notificationId);
  if (!existing) {
    res.status(404).json({ error: "Reminder not found" });
    return;
  }

  reminderDao.delete(dtoIn.notificationId);

  res.json({
    notificationId: dtoIn.notificationId,
    deleted: true
  });
}

module.exports = DeleteAbl;
