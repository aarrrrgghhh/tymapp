import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ReminderDashboard from "./reminder/reminder-dashboard";
import ReminderPopup from "./reminder/reminder-popup";
import MedicationList from "./medication/medication-list";
import MedicationForm from "./medication/medication-form";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);
  const [dashboardReloadKey, setDashboardReloadKey] = useState(0);

  function reloadDashboard() {
    setDashboardReloadKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("reminderDue", (reminder) => {
      console.log("Reminder received:", reminder);
      setActiveReminder(reminder);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {activeReminder && (
        <ReminderPopup
          reminder={activeReminder}
          onClose={() => setActiveReminder(null)}
          onReminderUpdated={reloadDashboard}
        />
      )}

      {activePage === "home" && (
        <ReminderDashboard
          key={dashboardReloadKey}
          setActivePage={setActivePage}
          setSelectedMedication={setSelectedMedication}
        />
      )}

      {activePage === "medication" && (
        <MedicationList
          setActivePage={setActivePage}
          setSelectedMedication={setSelectedMedication}
        />
      )}

      {activePage === "medication-form" && (
        <MedicationForm
          setActivePage={setActivePage}
          selectedMedication={selectedMedication}
        />
      )}
    </div>
  );
}

export default App;