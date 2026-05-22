import { useEffect, useState } from "react";

function ReminderDashboard() {
  const [reminderList, setReminderList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/reminder/listFromToday")
      .then((response) => response.json())
      .then((data) => {
        setReminderList(data.reminderList || []);
      })
      .catch((error) => {
        console.error("Failed to load reminders:", error);
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {reminderList.length === 0 ? (
        <p>No reminders yet. Add your first medication.</p>
      ) : (
        <ul>
          {reminderList.map((reminder) => (
            <li key={reminder.notificationId}>
              {reminder.scheduledDateTime} — {reminder.status} — Take{" "}
              {reminder.calculatedPills} pill(s)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReminderDashboard;