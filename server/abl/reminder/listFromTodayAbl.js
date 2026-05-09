const reminderDao = require("../../dao/reminder-dao.js");

function ListFromTodayAbl(req, res) {
  // dtoIn is empty → no validation needed
  const now = new Date().toISOString();

  // Load all reminders
  const allReminders = reminderDao.list();

  // Filter reminders scheduled for today or later
  const filtered = allReminders.filter(r => r.scheduledDateTime >= now);

  // Sort by scheduledDateTime ascending
  filtered.sort((a, b) => a.scheduledDateTime.localeCompare(b.scheduledDateTime));

  // dtoOut
  res.json({
    reminders: filtered
  });
}

module.exports = ListFromTodayAbl;
