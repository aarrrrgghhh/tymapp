const reminderDao = require("../../dao/reminder-dao.js");
const reminderService = require("../../service/reminder-service.js");

function ListFromTodayAbl(req, res) {
  try {
    reminderService.autoMarkMissedReminders();

    const dtoOut = reminderDao.listFromToday();

    res.json(dtoOut);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: e.message
    });
  }
}

module.exports = ListFromTodayAbl;