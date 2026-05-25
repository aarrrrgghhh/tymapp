const fs = require("fs");
const path = require("path");

const reminderFolderPath = path.join(__dirname, "storage", "reminderList");

if (!fs.existsSync(reminderFolderPath)) {
  fs.mkdirSync(reminderFolderPath, { recursive: true });
}

class ReminderDao {
  create(reminder) {
    const filePath = path.join(
      reminderFolderPath,
      `${reminder.notificationId}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(reminder, null, 2), "utf8");
    return reminder;
  }

  get(notificationId) {
    const filePath = path.join(reminderFolderPath, `${notificationId}.json`);

    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  }

  
  listByMedicationId(medicationId) {
  const files = fs.readdirSync(reminderFolderPath);

  const reminderList = files
    .map((file) => {
      const content = fs.readFileSync(
        path.join(reminderFolderPath, file),
        "utf8"
      );

      return JSON.parse(content);
    })
    .filter((reminder) => reminder.medicationId === medicationId)
    .sort((a, b) => {
      return new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime);
    });

  return { reminderList };
}

  listFromToday() {
    const today = new Date().toISOString().split("T")[0];
    const files = fs.readdirSync(reminderFolderPath);

    const reminderList = files
      .map((file) => {
        const content = fs.readFileSync(
          path.join(reminderFolderPath, file),
          "utf8"
        );

        return JSON.parse(content);
      })
      .filter((reminder) => {
        const reminderDate = reminder.scheduledDateTime.split("T")[0];
        return reminderDate >= today;
      })
      .sort((a, b) => {
        return new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime);
      });

    return { reminderList };
  }

  update(reminder) {
    const filePath = path.join(
      reminderFolderPath,
      `${reminder.notificationId}.json`
    );

    if (!fs.existsSync(filePath)) return null;

    fs.writeFileSync(filePath, JSON.stringify(reminder, null, 2), "utf8");
    return reminder;
  }

  delete(notificationId) {
    const filePath = path.join(reminderFolderPath, `${notificationId}.json`);

    if (!fs.existsSync(filePath)) return null;

    fs.unlinkSync(filePath);
    return true;
  }
}

module.exports = new ReminderDao();