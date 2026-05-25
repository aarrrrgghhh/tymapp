async function updateReminderStatus(notificationId, status) {
  const response = await fetch("http://localhost:3000/reminder/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update reminder status");
  }

  return response.json();
}

function ReminderPopup({
  reminder,
  onClose,
  onReminderUpdated,
}) {
  async function handleStatusClick(status) {
    try {
      await updateReminderStatus(
        reminder.notificationId,
        status
      );

      onReminderUpdated();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Reminder status update failed.");
    }
  }

  return (
    <div className="reminder-toast">
      <div className="reminder-toast-content">
        <h3>Medication Reminder</h3>

        <p>{reminder.message}</p>

        <div className="reminder-toast-buttons">
          <button onClick={() => handleStatusClick("TAKEN")}>
            Taken
          </button>

          <button onClick={() => handleStatusClick("MISSED")}>
            Missed
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReminderPopup;