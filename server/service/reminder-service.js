const crypto = require("crypto");
const reminderDao = require("../dao/reminder-dao.js");

const GENERATION_DAYS = 14;

function calculatePills(medication) {
  return medication.personalDosageValue / medication.dosageStrengthValue;
}

function combineDateAndTime(date, time) {
  const datePart = date.toISOString().split("T")[0];
  return new Date(`${datePart}T${time}:00.000Z`);
}

function generateForDate(medication, date) {
  const reminders = [];
  const calculatedPills = calculatePills(medication);

  if (medication.scheduleType === "DAILY") {
    medication.reminderTimes.forEach((time) => {
      reminders.push(createReminder(medication, combineDateAndTime(date, time), calculatedPills));
    });
  }

  if (medication.scheduleType === "WEEKLY") {
    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayMap[date.getUTCDay()];

    if (medication[dayName]) {
      medication.reminderTimes.forEach((time) => {
        reminders.push(createReminder(medication, combineDateAndTime(date, time), calculatedPills));
      });
    }
  }

  if (medication.scheduleType === "INTERVAL") {
    let current = combineDateAndTime(date, medication.intervalStartTime);

    while (current.toISOString().startsWith(date.toISOString().split("T")[0])) {
      reminders.push(createReminder(medication, current, calculatedPills));
      current = new Date(current.getTime() + medication.intervalHours * 60 * 60 * 1000);
    }
  }

  if (medication.scheduleType === "CYCLE") {
    // For now: cycle starts from medication creation date or today
    const startDate = medication.createdAt
      ? new Date(medication.createdAt)
      : new Date();

    const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    const cycleLength = medication.cycleOnDays + medication.cycleOffDays;
    const cycleDay = diffDays % cycleLength;

    if (cycleDay >= 0 && cycleDay < medication.cycleOnDays) {
      medication.reminderTimes.forEach((time) => {
        reminders.push(createReminder(medication, combineDateAndTime(date, time), calculatedPills));
      });
    }
  }

  return reminders;
}

function createReminder(medication, scheduledDateTime, calculatedPills) {
  return {
    notificationId: "rem-" + crypto.randomUUID(),
    medicationId: medication.medicationId,
    scheduledDateTime: scheduledDateTime.toISOString(),
    status: "UPCOMING",
    calculatedPills
  };
}

function generateNext14Days(medication) {
  const generated = [];
  const today = new Date();

  for (let i = 0; i < GENERATION_DAYS; i++) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + i);

    const remindersForDate = generateForDate(medication, date);

    remindersForDate.forEach((reminder) => {
      reminderDao.create(reminder);
      generated.push(reminder);
    });
  }

  return generated;
}

function generateForPlus14Day(medication) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + GENERATION_DAYS);

  const reminders = generateForDate(medication, date);

  reminders.forEach((reminder) => reminderDao.create(reminder));

  return reminders;
}

function regenerateForMedication(medication) {
  reminderDao.deleteByMedicationId(medication.medicationId);
  return generateNext14Days(medication);
}

module.exports = {
  generateNext14Days,
  generateForPlus14Day,
  regenerateForMedication
};