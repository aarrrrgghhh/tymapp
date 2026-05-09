const medicationDao = require("../../dao/medication-dao.js");
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
    dosageStrengthValue: { type: "number", minimum: 0 },
    dosageStrengthUnit: { type: "string", minLength: 1 },
    personalDosageValue: { type: "number", minimum: 0 },
    personalDosageUnit: { type: "string", minLength: 1 },
    scheduleType: {
      type: "string",
      enum: ["DAILY", "WEEKLY", "INTERVAL", "CYCLE"]
    },
    reminderTimes: {
      type: "array",
      items: {
        type: "string",
        pattern: "^[0-2][0-9]:[0-5][0-9]$"
      }
    },
    monday: { type: "boolean" },
    tuesday: { type: "boolean" },
    wednesday: { type: "boolean" },
    thursday: { type: "boolean" },
    friday: { type: "boolean" },
    saturday: { type: "boolean" },
    sunday: { type: "boolean" },
    intervalHours: { type: "number", minimum: 1 },
    intervalStartTime: {
      type: "string",
      pattern: "^[0-2][0-9]:[0-5][0-9]$"
    },
    cycleOnDays: { type: "number", minimum: 1 },
    cycleOffDays: { type: "number", minimum: 0 }
  }
};

function UpdateAbl(req, res) {
  const dtoIn = req.body;

  const validate = ajv.compile(medicationUpdateSchema);
  if (!validate(dtoIn)) {
    res.status(400).json({ error: validate.errors });
    return;
  }

  const existing = medicationDao.get(dtoIn.medicationId);
  if (!existing) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }

  const merged = { ...existing, ...dtoIn };

  merged.personalDosageUnit = merged.dosageStrengthUnit;

  let dtoOut;

  switch (merged.scheduleType) {
    case "DAILY":
      dtoOut = {
        medicationId: merged.medicationId,
        brandName: merged.brandName,
        genericName: merged.genericName,
        dosageStrengthValue: merged.dosageStrengthValue,
        dosageStrengthUnit: merged.dosageStrengthUnit,
        personalDosageValue: merged.personalDosageValue,
        personalDosageUnit: merged.personalDosageUnit,
        scheduleType: "DAILY",
        reminderTimes: merged.reminderTimes
      };
      break;

    case "WEEKLY":
      dtoOut = {
        medicationId: merged.medicationId,
        brandName: merged.brandName,
        genericName: merged.genericName,
        dosageStrengthValue: merged.dosageStrengthValue,
        dosageStrengthUnit: merged.dosageStrengthUnit,
        personalDosageValue: merged.personalDosageValue,
        personalDosageUnit: merged.personalDosageUnit,
        scheduleType: "WEEKLY",
        monday: merged.monday,
        tuesday: merged.tuesday,
        wednesday: merged.wednesday,
        thursday: merged.thursday,
        friday: merged.friday,
        saturday: merged.saturday,
        sunday: merged.sunday,
        reminderTimes: merged.reminderTimes
      };
      break;

    case "INTERVAL":
      dtoOut = {
        medicationId: merged.medicationId,
        brandName: merged.brandName,
        genericName: merged.genericName,
        dosageStrengthValue: merged.dosageStrengthValue,
        dosageStrengthUnit: merged.dosageStrengthUnit,
        personalDosageValue: merged.personalDosageValue,
        personalDosageUnit: merged.personalDosageUnit,
        scheduleType: "INTERVAL",
        intervalHours: merged.intervalHours,
        intervalStartTime: merged.intervalStartTime
      };
      break;

    case "CYCLE":
      dtoOut = {
        medicationId: merged.medicationId,
        brandName: merged.brandName,
        genericName: merged.genericName,
        dosageStrengthValue: merged.dosageStrengthValue,
        dosageStrengthUnit: merged.dosageStrengthUnit,
        personalDosageValue: merged.personalDosageValue,
        personalDosageUnit: merged.personalDosageUnit,
        scheduleType: "CYCLE",
        cycleOnDays: merged.cycleOnDays,
        cycleOffDays: merged.cycleOffDays,
        reminderTimes: merged.reminderTimes
      };
      break;
  }

  medicationDao.update(dtoOut);

  res.json(dtoOut);
}

module.exports = UpdateAbl;
