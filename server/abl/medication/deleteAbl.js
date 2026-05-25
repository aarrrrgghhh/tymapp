const medicationDao = require("../../dao/medication-dao.js");
const reminderDao = require("../../dao/reminder-dao.js");
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
  try {
    const dtoIn = req.body;

    const validate = ajv.compile(deleteSchema);
    if (!validate(dtoIn)) {
      return res.status(400).json({ error: validate.errors });
    }

    const existing = medicationDao.get(dtoIn.medicationId);
    if (!existing) {
      return res.status(404).json({ error: "Medication not found" });
    }

    const reminders = reminderDao.list().reminderList;

    let deletedReminderCount = 0;

    reminders
      .filter((reminder) => reminder.medicationId === dtoIn.medicationId)
      .forEach((reminder) => {
        const deleted = reminderDao.delete(reminder.notificationId);

        if (deleted) {
          deletedReminderCount++;
        }
      });

    medicationDao.delete(dtoIn.medicationId);

    res.json({
      medicationId: dtoIn.medicationId,
      deleted: true,
      deletedReminderCount
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: e.message
    });
  }
}

module.exports = DeleteAbl;