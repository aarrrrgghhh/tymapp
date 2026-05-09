const medicationDao = require("../../dao/medication-dao.js");
const reminderDao = require("../../dao/reminder-dao.js");
const reminderService = require("../../service/reminder-service.js");
const Ajv = require("ajv");

const ajv = new Ajv();

const medicationUpdateSchema = {
  type: "object",
  required: ["medicationId"],
  additionalProperties: false,
  properties: {
    medicationId: { type: "string", minLength: 1 },
    brandName: { type: "string", minLength: 1 },
    genericName: { type: "string", minLength: 1 },
    dosageStrengthValue: { type: "number", minimum: 0.1 },
    dosageStrengthUnit: { type: "string", enum: ["mg", "µg", "IU"] },
    personalDosageValue: { type: "number", minimum: 0.1 },
    scheduleType: {
      type: "string",
      enum: ["DAILY", "WEEKLY", "INTERVAL", "CYCLE"]
    },
    reminderTimes: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      uniqueItems: true,
      items: {
        type: "string",
        pattern: "^([01]\\d|2[0-3]):[0-5]\\d$"
      }
    },
    monday: { type: "boolean" },
    tuesday: { type: "boolean" },
    wednesday: { type: "boolean" },
    thursday: { type: "boolean" },
    friday: { type: "boolean" },
    saturday: { type: "boolean" },
    sunday: { type: "boolean" },
    intervalHours: { type: "integer", minimum: 1, maximum: 12 },
    intervalStartTime: {
      type: "string",
      pattern: "^([01]\\d|2[0-3]):[0-5]\\d$"
    },
    cycleOnDays: { type: "integer", minimum: 1, maximum: 30 },
    cycleOffDays: { type: "integer", minimum: 1, maximum: 30 }
  }
};

function scheduleChanged(existing, dtoIn) {
  const scheduleFields = [
    "scheduleType",
    "reminderTimes",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "intervalHours",
    "intervalStartTime",
    "cycleOnDays",
    "cycleOffDays"
  ];

  return scheduleFields.some((field) => {
    if (!(field in dtoIn)) return false;
    return JSON.stringify(existing[field]) !== JSON.stringify(dtoIn[field]);
  });
}

function dosageChanged(existing, dtoIn) {
  return (
    ("dosageStrengthValue" in dtoIn &&
      existing.dosageStrengthValue !== dtoIn.dosageStrengthValue) ||
    ("personalDosageValue" in dtoIn &&
      existing.personalDosageValue !== dtoIn.personalDosageValue)
  );
}

function normalizeMedication(medication) {
  medication.personalDosageUnit = medication.dosageStrengthUnit;

  if (medication.scheduleType === "DAILY") {
    medication.monday = false;
    medication.tuesday = false;
    medication.wednesday = false;
    medication.thursday = false;
    medication.friday = false;
    medication.saturday = false;
    medication.sunday = false;
    medication.intervalHours = 0;
    medication.intervalStartTime = "00:00";
    medication.cycleOnDays = 0;
    medication.cycleOffDays = 0;
  }

  if (medication.scheduleType === "WEEKLY") {
    medication.intervalHours = 0;
    medication.intervalStartTime = "00:00";
    medication.cycleOnDays = 0;
    medication.cycleOffDays = 0;
  }

  if (medication.scheduleType === "INTERVAL") {
    medication.reminderTimes = [];
    medication.monday = false;
    medication.tuesday = false;
    medication.wednesday = false;
    medication.thursday = false;
    medication.friday = false;
    medication.saturday = false;
    medication.sunday = false;
    medication.cycleOnDays = 0;
    medication.cycleOffDays = 0;
  }

  if (medication.scheduleType === "CYCLE") {
    medication.monday = false;
    medication.tuesday = false;
    medication.wednesday = false;
    medication.thursday = false;
    medication.friday = false;
    medication.saturday = false;
    medication.sunday = false;
    medication.intervalHours = 0;
    medication.intervalStartTime = "00:00";
  }

  return medication;
}

function deleteRemindersForMedication(medicationId) {
  const reminders = reminderDao.listFromToday().reminderList;

  reminders
    .filter((reminder) => reminder.medicationId === medicationId)
    .forEach((reminder) => {
      reminderDao.delete(reminder.notificationId);
    });
}

function recalculateReminderPills(medication) {
  const reminders = reminderDao.listFromToday().reminderList;
  const calculatedPills =
    medication.personalDosageValue / medication.dosageStrengthValue;

  reminders
    .filter((reminder) => reminder.medicationId === medication.medicationId)
    .forEach((reminder) => {
      reminder.calculatedPills = calculatedPills;
      reminderDao.update(reminder);
    });
}

function UpdateAbl(req, res) {
  try {
    const dtoIn = req.body;

    const validate = ajv.compile(medicationUpdateSchema);
    if (!validate(dtoIn)) {
      return res.status(400).json({ error: validate.errors });
    }

    const existing = medicationDao.get(dtoIn.medicationId);
    if (!existing) {
      return res.status(404).json({ error: "Medication not found" });
    }

    const isScheduleChanged = scheduleChanged(existing, dtoIn);
    const isDosageChanged = dosageChanged(existing, dtoIn);

    const merged = normalizeMedication({
      ...existing,
      ...dtoIn
    });

    const updatedMedication = medicationDao.update(merged);

    let regeneratedReminderCount = 0;

    if (isScheduleChanged) {
      deleteRemindersForMedication(updatedMedication.medicationId);
      const newReminders = reminderService.generateNext14Days(updatedMedication);
      regeneratedReminderCount = newReminders.length;
    } else if (isDosageChanged) {
      recalculateReminderPills(updatedMedication);
    }

    res.json({
      medication: updatedMedication,
      scheduleChanged: isScheduleChanged,
      dosageChanged: isDosageChanged,
      regeneratedReminderCount
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: e.message
    });
  }
}

module.exports = UpdateAbl;