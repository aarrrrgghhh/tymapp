const express = require("express");
const app = express();

app.use(express.json());

// Controllers
const medicationController = require("./controller/medication.js");
const reminderController = require("./controller/reminder.js");

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

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
