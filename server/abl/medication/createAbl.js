const medicationDao = require("../../dao/medication-dao.js");
const reminderService = require("../../service/reminder-service.js");
const crypto = require("crypto");
const Ajv = require("ajv");

const ajv = new Ajv();

const commonSchema = {
  type: "object",
  properties: {
    brandName: { type: "string", minLength: 1, maxLength: 100 },
    genericName: { type: "string", minLength: 1, maxLength: 150 },
    dosageStrengthValue: { type: "number", minimum: 0.1, maximum: 10000 },
    dosageStrengthUnit: { type: "string", enum: ["mg", "µg", "IU"] },
    personalDosageValue: { type: "number", minimum: 0.1, maximum: 10000 },
    scheduleType: { type: "string", enum: ["DAILY", "WEEKLY", "INTERVAL", "CYCLE"] }
  },
  required: [
    "brandName",
    "dosageStrengthValue",
    "dosageStrengthUnit",
    "personalDosageValue",
    "scheduleType"
  ],
  additionalProperties: true
};

const dailySchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    genericName: { type: "string" },
    dosageStrengthValue: { type: "number" },
    dosageStrengthUnit: { type: "string" },
    personalDosageValue: { type: "number" },
    scheduleType: { type: "string" },
    reminderTimes: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      uniqueItems: true,
      items: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
    }
  },
  required: [
    "brandName",
    "dosageStrengthValue",
    "dosageStrengthUnit",
    "personalDosageValue",
    "scheduleType",
    "reminderTimes"
  ],
  additionalProperties: false
};

const weeklySchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    genericName: { type: "string" },
    dosageStrengthValue: { type: "number" },
    dosageStrengthUnit: { type: "string" },
    personalDosageValue: { type: "number" },
    scheduleType: { type: "string" },
    monday: { type: "boolean" },
    tuesday: { type: "boolean" },
    wednesday: { type: "boolean" },
    thursday: { type: "boolean" },
    friday: { type: "boolean" },
    saturday: { type: "boolean" },
    sunday: { type: "boolean" },
    reminderTimes: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      uniqueItems: true,
      items: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
    }
  },
  required: [
    "brandName",
    "dosageStrengthValue",
    "dosageStrengthUnit",
    "personalDosageValue",
    "scheduleType",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "reminderTimes"
  ],
  anyOf: [
    { properties: { monday: { const: true } } },
    { properties: { tuesday: { const: true } } },
    { properties: { wednesday: { const: true } } },
    { properties: { thursday: { const: true } } },
    { properties: { friday: { const: true } } },
    { properties: { saturday: { const: true } } },
    { properties: { sunday: { const: true } } }
  ],
  additionalProperties: false
};

const intervalSchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    genericName: { type: "string" },
    dosageStrengthValue: { type: "number" },
    dosageStrengthUnit: { type: "string" },
    personalDosageValue: { type: "number" },
    scheduleType: { type: "string" },
    intervalHours: { type: "integer", minimum: 1, maximum: 12 },
    intervalStartTime: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
  },
  required: [
    "brandName",
    "dosageStrengthValue",
    "dosageStrengthUnit",
    "personalDosageValue",
    "scheduleType",
    "intervalHours",
    "intervalStartTime"
  ],
  additionalProperties: false
};

const cycleSchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    genericName: { type: "string" },
    dosageStrengthValue: { type: "number" },
    dosageStrengthUnit: { type: "string" },
    personalDosageValue: { type: "number" },
    scheduleType: { type: "string" },
    cycleOnDays: { type: "integer", minimum: 1, maximum: 30 },
    cycleOffDays: { type: "integer", minimum: 1, maximum: 30 },
    reminderTimes: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      uniqueItems: true,
      items: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
    }
  },
  required: [
    "brandName",
    "dosageStrengthValue",
    "dosageStrengthUnit",
    "personalDosageValue",
    "scheduleType",
    "cycleOnDays",
    "cycleOffDays",
    "reminderTimes"
  ],
  additionalProperties: false
};

function CreateAbl(req, res) {
  try {
    const dtoIn = req.body;

    const validateCommon = ajv.compile(commonSchema);
    if (!validateCommon(dtoIn)) {
      return res.status(400).json({ error: validateCommon.errors });
    }

    let schema;
    switch (dtoIn.scheduleType) {
      case "DAILY":
        schema = dailySchema;
        break;
      case "WEEKLY":
        schema = weeklySchema;
        break;
      case "INTERVAL":
        schema = intervalSchema;
        break;
      case "CYCLE":
        schema = cycleSchema;
        break;
    }

    const validateSpecific = ajv.compile(schema);
    if (!validateSpecific(dtoIn)) {
      return res.status(400).json({ error: validateSpecific.errors });
    }

    const medication = {
      medicationId: "med-" + crypto.randomUUID(),
      brandName: dtoIn.brandName,
      genericName: dtoIn.genericName ?? null,
      dosageStrengthValue: dtoIn.dosageStrengthValue,
      dosageStrengthUnit: dtoIn.dosageStrengthUnit,
      personalDosageValue: dtoIn.personalDosageValue,
      personalDosageUnit: dtoIn.dosageStrengthUnit,
      scheduleType: dtoIn.scheduleType,
      monday: dtoIn.monday ?? false,
      tuesday: dtoIn.tuesday ?? false,
      wednesday: dtoIn.wednesday ?? false,
      thursday: dtoIn.thursday ?? false,
      friday: dtoIn.friday ?? false,
      saturday: dtoIn.saturday ?? false,
      sunday: dtoIn.sunday ?? false,
      cycleOnDays: dtoIn.cycleOnDays ?? 0,
      cycleOffDays: dtoIn.cycleOffDays ?? 0,
      intervalHours: dtoIn.intervalHours ?? 0,
      intervalStartTime: dtoIn.intervalStartTime ?? "00:00",
      reminderTimes: dtoIn.reminderTimes ?? [],
      createdAt: new Date().toISOString()
    };

    const storedMedication = medicationDao.create(medication);

    const reminders = reminderService.generateNext14Days(storedMedication);

    res.json({
      medication: storedMedication,
      generatedReminderCount: reminders.length
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: e.message
    });
  }
}

module.exports = CreateAbl;