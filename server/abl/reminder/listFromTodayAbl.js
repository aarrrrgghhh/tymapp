const reminderDao = require("../../dao/reminder-dao.js");

function ListFromTodayAbl(req, res) {
  const now = new Date().toISOString();

  // Load all reminders correctly
  const { reminderList } = reminderDao.list();

  // Filter reminders scheduled for today or later
  const filtered = reminderList.filter(r => r.scheduledDateTime >= now);

  // Sort by scheduledDateTime ascending
  filtered.sort((a, b) => a.scheduledDateTime.localeCompare(b.scheduledDateTime));

  res.json({
    reminders: filtered
  });
}

module.exports = ListFromTodayAbl;
