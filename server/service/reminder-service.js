const crypto = require("crypto");
const reminderDao = require("../dao/reminder-dao.js");

const GENERATION_DAYS = 14;

function calculatePills(medication) {
  return medication.personalDosageValue / medication.dosageStrengthValue;
}

function createReminder(medication, scheduledDateTime) {
  return {
    notificationId: "rem-" + crypto.randomUUID(),
    medicationId: medication.medicationId,
    scheduledDateTime: scheduledDateTime.toISOString(),
    status: "UPCOMING",
    calculatedPills: calculatePills(medication)
  };
}

function dateWithTime(date, time) {
  const datePart = date.toISOString().split("T")[0];
  return new Date(`${datePart}T${time}:00.000Z`);
}

function generateForOneDay(medication, date) {
  const reminders = [];

  if (medication.scheduleType === "DAILY") {
    medication.reminderTimes.forEach((time) => {
      reminders.push(createReminder(medication, dateWithTime(date, time)));
    });
  }

  if (medication.scheduleType === "WEEKLY") {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    const dayName = days[date.getUTCDay()];

    if (medication[dayName]) {
      medication.reminderTimes.forEach((time) => {
        reminders.push(createReminder(medication, dateWithTime(date, time)));
      });
    }
  }

  if (medication.scheduleType === "INTERVAL") {
    let current = dateWithTime(date, medication.intervalStartTime);
    const currentDate = date.toISOString().split("T")[0];

    while (current.toISOString().split("T")[0] === currentDate) {
      reminders.push(createReminder(medication, current));

      current = new Date(
        current.getTime() +
          medication.intervalHours * 60 * 60 * 1000
      );
    }
  }

  if (medication.scheduleType === "CYCLE") {
    const startDate = medication.createdAt
      ? new Date(medication.createdAt)
      : new Date();

    const diffDays = Math.floor(
      (date - startDate) / (1000 * 60 * 60 * 24)
    );

    const cycleLength =
      medication.cycleOnDays + medication.cycleOffDays;

    const cycleDay = diffDays % cycleLength;

    if (cycleDay >= 0 && cycleDay < medication.cycleOnDays) {
      medication.reminderTimes.forEach((time) => {
        reminders.push(createReminder(medication, dateWithTime(date, time)));
      });
    }
  }

  return reminders;
}

function generateNext14Days(medication) {
  const createdReminders = [];
  const now = new Date();

  for (let i = 0; i < GENERATION_DAYS; i++) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() + i);

    const reminders = generateForOneDay(medication, date);

    reminders.forEach((reminder) => {
      if (new Date(reminder.scheduledDateTime) >= now) {
        reminderDao.create(reminder);
        createdReminders.push(reminder);
      }
    });
  }

  return createdReminders;
}

function generateForPlus14Day(medication) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + GENERATION_DAYS);

  const createdReminders = [];
  const reminders = generateForOneDay(medication, date);

  reminders.forEach((reminder) => {
    reminderDao.create(reminder);
    createdReminders.push(reminder);
  });

  return createdReminders;
}

function autoMarkMissedReminders() {
  const reminders = reminderDao.listFromToday().reminderList;
  const now = new Date();

  reminders.forEach((reminder) => {
    if (reminder.status !== "UPCOMING") {
      return;
    }

    const scheduledDateTime = new Date(
      reminder.scheduledDateTime
    );

    const missedThreshold = new Date(
      scheduledDateTime.getTime() + 4 * 60 * 60 * 1000
    );

    if (now >= missedThreshold) {
      reminder.status = "MISSED";
      reminderDao.update(reminder);
    }
  });
}

module.exports = {
  generateNext14Days,
  generateForPlus14Day,
  autoMarkMissedReminders
};