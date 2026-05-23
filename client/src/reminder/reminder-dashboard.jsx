import { useEffect, useState } from "react";
import BottomNavbar from "../common/bottom-navbar";

function ReminderDashboard({ setActivePage }) {
  const [reminderList, setReminderList] = useState([]);
  const [medicationList, setMedicationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/reminder/listFromToday"),
      fetch("http://localhost:3000/medication/list")
    ])
      .then(([reminderResponse, medicationResponse]) => {
        if (!reminderResponse.ok || !medicationResponse.ok) {
          throw new Error("Backend returned an error.");
        }

        return Promise.all([
          reminderResponse.json(),
          medicationResponse.json()
        ]);
      })
      .then(([reminderData, medicationData]) => {
        setReminderList(reminderData.reminderList || []);
        setMedicationList(medicationData.medicationList || []);
        setError(null);
      })
      .catch((error) => {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load dashboard.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  

  const upcomingReminderList = reminderList
    .filter((reminder) => reminder.status === "UPCOMING")
    .sort(
      (a, b) =>
        new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime)
    );

  function getMedication(reminder) {
    return medicationList.find(
      (medication) => medication.medicationId === reminder.medicationId
    );
  }

  function getDateLabel(date) {
    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateOnly = date.toDateString();
    const todayOnly = today.toDateString();
    const tomorrowOnly = tomorrow.toDateString();

    if (dateOnly === todayOnly) {
      return "TODAY";
    }

    if (dateOnly === tomorrowOnly) {
      return "TOMORROW";
    }

    return (
      date
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        })
        .toUpperCase() +
      " " +
      date
        .toLocaleDateString("en-US", {
          weekday: "short"
        })
        .toUpperCase()
    );
  }

  const groupedReminders = upcomingReminderList.reduce(
    (groups, reminder) => {
      const scheduledDate = new Date(reminder.scheduledDateTime);

      const label = getDateLabel(scheduledDate);

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(reminder);

      return groups;
    },
    {}
  );

  function markAsTaken(reminder) {
    fetch("http://localhost:3000/reminder/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        notificationId: reminder.notificationId,
        status: "TAKEN"
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update reminder.");
        }

        return response.json();
      })
      .then(() => {
        setReminderList((currentList) =>
          currentList.map((currentReminder) =>
            currentReminder.notificationId === reminder.notificationId
              ? {
                  ...currentReminder,
                  status: "TAKEN"
                }
              : currentReminder
          )
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
  <div className="app-page">
    <h1>Take Your Meds</h1>

    {isLoading && <p>Loading reminders...</p>}

    {!isLoading && error && <p>{error}</p>}

    {!isLoading && !error && upcomingReminderList.length === 0 && (
     <>
  <p>No reminders yet. Add your first medication.</p>

  <div className="add-medication-item">
    + Add Medication
  </div>
</>
    )}

    {!isLoading && !error && upcomingReminderList.length > 0 && (
      <>
        {Object.entries(groupedReminders).map(([dateLabel, reminders]) => (
          <div key={dateLabel}>
            <h2>{dateLabel}</h2>

            <ul>
              {reminders.map((reminder) => {
                const scheduledDate = new Date(reminder.scheduledDateTime);
                const medication = getMedication(reminder);

                const medicationName = medication
                  ? medication.brandName
                  : "Unknown medication";

                const dosageStrength = medication
                  ? `${medication.dosageStrengthValue} ${medication.dosageStrengthUnit}`
                  : "";

                return (
                  <li
                    key={reminder.notificationId}
                    className="reminder-item"
                  >
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div>
                        {scheduledDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>

                      <div>
                        <strong>
                          {medicationName} {dosageStrength}
                        </strong>

                        <br />

                        Take {reminder.calculatedPills} pill(s)
                      </div>
                    </div>

                    <input
                      type="radio"
                      onChange={() => markAsTaken(reminder)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </>
    )}

    <BottomNavbar
      activePage="home"
      setActivePage={setActivePage}
    />
  </div>
);
}

export default ReminderDashboard;