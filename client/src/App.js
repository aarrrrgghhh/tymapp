import { useState } from "react";
import ReminderDashboard from "./reminder/reminder-dashboard";
import MedicationList from "./medication/medication-list";

function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div>
      {activePage === "home" && (
        <ReminderDashboard setActivePage={setActivePage} />
      )}

      {activePage === "medication" && (
        <MedicationList setActivePage={setActivePage} />
      )}
    </div>
  );
}

export default App;