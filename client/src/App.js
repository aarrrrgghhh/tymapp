import { useState } from "react";

import ReminderDashboard from "./reminder/reminder-dashboard";
import MedicationList from "./medication/medication-list";
import MedicationForm from "./medication/medication-form";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedMedication, setSelectedMedication] = useState(null);

  return (
    <div>
      {activePage === "home" && (
       <ReminderDashboard
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
  key={selectedMedication ? selectedMedication.medicationId : "create"}
  setActivePage={setActivePage}
  selectedMedication={selectedMedication}
/>
      )}
    </div>
  );
}

export default App;