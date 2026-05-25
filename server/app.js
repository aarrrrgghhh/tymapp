const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json());
app.use(cors());

// Controllers
const medicationController = require("./controller/medication.js");
const reminderController = require("./controller/reminder.js");

// DAO + Services
const medicationDao = require("./dao/medication-dao.js");
const reminderDao = require("./dao/reminder-dao.js");
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
    const reminders = reminderService.generateForPlus14Day(medication);
    generatedCount += reminders.length;
  });

  res.json({ generatedCount });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);
});

// Push due reminders to frontend
function pushDueReminders() {
  const now = new Date();
  const reminders = reminderDao.listFromToday().reminderList;

  reminders.forEach((reminder) => {
    if (reminder.status !== "UPCOMING") return;
    if (reminder.notifiedAt) return;

    const scheduledDateTime = new Date(reminder.scheduledDateTime);

    if (scheduledDateTime <= now) {
      reminder.notifiedAt = now.toISOString();
      reminderDao.update(reminder);

      const medication = medicationDao.get(reminder.medicationId);

    

      io.emit("reminderDue", {
        notificationId: reminder.notificationId,
        medicationId: reminder.medicationId,
        scheduledDateTime: reminder.scheduledDateTime,
        calculatedPills: reminder.calculatedPills,
       message: `Time to take ${medication.brandName} ${medication.dosageStrengthValue} ${medication.dosageStrengthUnit}. Take ${reminder.calculatedPills} pill(s).`
      });

      console.log("Reminder pushed:", reminder.notificationId);
    }
  });
}

// when reminder is due 4 hours 
setInterval(reminderService.autoMarkMissedReminders, 60 * 1000);


// every minute
setInterval(pushDueReminders, 60 * 1000);

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});