const express = require("express");
const app = express();

app.use(express.json());

// Controllers
const medicationController = require("./controller/medication.js");
const reminderController = require("./controller/reminder.js");

// DAO + Services
const medicationDao = require("./dao/medication-dao.js");
const reminderService = require("./service/reminder-service.js");

// Medication routes
app.post("/medication/create", medicationController.create);
app.get("/medication/list", medicationController.list);
app.post("/medication/update", medicationController.update);
app.post("/medication/delete", medicationController.delete);

// Reminder routes
app.post("/reminder/create", reminderController.create);
app.post("/reminder/update", reminderController.update);
app.post("/reminder/delete", reminderController.delete);
app.get("/reminder/listFromToday", reminderController.listFromToday);

// TEST ROUTE FOR +14 GENERATION
app.post("/reminder/generatePlus14", (req, res) => {
  const medications = medicationDao.list();

  let generatedCount = 0;

  medications.forEach((medication) => {
    const reminders =
      reminderService.generateForPlus14Day(medication);

    generatedCount += reminders.length;
  });

  res.json({ generatedCount });
});

// DAILY SCHEDULER
function runDailyReminderGeneration() {
  const medications = medicationDao.list();

  medications.forEach((medication) => {
    reminderService.generateForPlus14Day(medication);
  });

  console.log("Daily +14 reminder generation completed");
}

// every 24 hours
setInterval(runDailyReminderGeneration, 24 * 60 * 60 * 1000);

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});