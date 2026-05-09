const fs = require("fs");
const path = require("path");

const reminderFolderPath = path.join(__dirname, "storage", "reminderList");

class ReminderDao {
  create(reminder) {
    const filePath = path.join(reminderFolderPath, `${reminder.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(reminder, null, 2), "utf8");
    return reminder;
  }

  listFromToday() {
    const today = new Date().toISOString().split("T")[0];
    const files = fs.readdirSync(reminderFolderPath);

    const reminderList = files
      .map((file) => {
        const content = fs.readFileSync(path.join(reminderFolderPath, file), "utf8");
        return JSON.parse(content);
      })
      .filter((reminder) => reminder.date >= today);

    return { reminderList };
  }

  update(reminder) {
    const filePath = path.join(reminderFolderPath, `${reminder.id}.json`);
    if (!fs.existsSync(filePath)) return null;
    fs.writeFileSync(filePath, JSON.stringify(reminder, null, 2), "utf8");
    return reminder;
  }

  delete(reminderId) {
    const filePath = path.join(reminderFolderPath, `${reminderId}.json`);
    if (!fs.existsSync(filePath)) return;
    fs.unlinkSync(filePath);
  }
}

module.exports = new ReminderDao();