import { FiTrash2 } from "react-icons/fi";
import { FiPlusCircle } from "react-icons/fi";
import { useEffect, useState } from "react";

function MedicationForm({ setActivePage, selectedMedication }) {
  const [brandName, setBrandName] = useState(selectedMedication?.brandName || "");
  const [genericName, setGenericName] = useState(selectedMedication?.genericName || "");
  const [dosageStrengthValue, setDosageStrengthValue] = useState(
    selectedMedication?.dosageStrengthValue || ""
  );
  const [dosageStrengthUnit, setDosageStrengthUnit] = useState(
    selectedMedication?.dosageStrengthUnit || "mg"
  );
  const [personalDosageValue, setPersonalDosageValue] = useState(
    selectedMedication?.personalDosageValue || ""
  );
  const [scheduleType, setScheduleType] = useState(
    selectedMedication?.scheduleType || "DAILY"
  );

  const [reminderTimes, setReminderTimes] = useState(
    selectedMedication?.reminderTimes || ["08:00"]
  );

  const [intervalHours, setIntervalHours] = useState(
    selectedMedication?.intervalHours || ""
  );
  const [intervalStartTime, setIntervalStartTime] = useState(
    selectedMedication?.intervalStartTime || "08:00"
  );

  const [weekdays, setWeekdays] = useState(
    selectedMedication?.scheduleType === "WEEKLY"
      ? [
          selectedMedication.monday ? "MONDAY" : null,
          selectedMedication.tuesday ? "TUESDAY" : null,
          selectedMedication.wednesday ? "WEDNESDAY" : null,
          selectedMedication.thursday ? "THURSDAY" : null,
          selectedMedication.friday ? "FRIDAY" : null,
          selectedMedication.saturday ? "SATURDAY" : null,
          selectedMedication.sunday ? "SUNDAY" : null
        ].filter(Boolean)
      : ["MONDAY"]
  );

  const [cycleOnDays, setCycleOnDays] = useState(
    selectedMedication?.cycleOnDays || ""
  );
  const [cycleOffDays, setCycleOffDays] = useState(
    selectedMedication?.cycleOffDays || ""
  );

  const [formError, setFormError] = useState({});

  const calculatedPills =
    dosageStrengthValue && personalDosageValue
      ? Number(personalDosageValue) / Number(dosageStrengthValue)
      : "";
      useEffect(() => {
  if (!selectedMedication) {
    return;
  }

  setBrandName(selectedMedication.brandName || "");
  setGenericName(selectedMedication.genericName || "");

  setDosageStrengthValue(
    selectedMedication.dosageStrengthValue || ""
  );

  setDosageStrengthUnit(
    selectedMedication.dosageStrengthUnit || "mg"
  );

  setPersonalDosageValue(
    selectedMedication.personalDosageValue || ""
  );

  setScheduleType(
    selectedMedication.scheduleType || "DAILY"
  );

  setReminderTimes(
    selectedMedication.reminderTimes || ["08:00"]
  );

  setIntervalHours(
    selectedMedication.intervalHours || ""
  );

  setIntervalStartTime(
    selectedMedication.intervalStartTime || "08:00"
  );

  setCycleOnDays(
    selectedMedication.cycleOnDays || ""
  );

  setCycleOffDays(
    selectedMedication.cycleOffDays || ""
  );

  if (selectedMedication.scheduleType === "WEEKLY") {
    setWeekdays(
      [
        selectedMedication.monday ? "MONDAY" : null,
        selectedMedication.tuesday ? "TUESDAY" : null,
        selectedMedication.wednesday ? "WEDNESDAY" : null,
        selectedMedication.thursday ? "THURSDAY" : null,
        selectedMedication.friday ? "FRIDAY" : null,
        selectedMedication.saturday ? "SATURDAY" : null,
        selectedMedication.sunday ? "SUNDAY" : null
      ].filter(Boolean)
    );
  }
}, [selectedMedication]);

  function handleSubmit(event) {
    event.preventDefault();
    setFormError({});

    if (!brandName.trim()) {
      setFormError({ brandName: "Brand name is required." });
      return;
    }

    if (!dosageStrengthValue || Number(dosageStrengthValue) < 0.01) {
      setFormError({
        dosageStrengthValue: "Dosage strength must be at least 0.01."
      });
      return;
    }

    if (!personalDosageValue || Number(personalDosageValue) < 0.01) {
      setFormError({
        personalDosageValue: "Personal dosage must be at least 0.01."
      });
      return;
    }

    if (
      scheduleType === "INTERVAL" &&
      (!intervalHours ||
        Number(intervalHours) < 1 ||
        Number(intervalHours) > 12)
    ) {
      setFormError({
        intervalHours: "Interval hours must be between 1 and 12."
      });
      return;
    }

    if (
      scheduleType === "CYCLE" &&
      (!cycleOnDays || Number(cycleOnDays) < 1 || Number(cycleOnDays) > 30)
    ) {
      setFormError({
        cycleOnDays: "Cycle on days must be between 1 and 30."
      });
      return;
    }

    if (
      scheduleType === "CYCLE" &&
      (!cycleOffDays || Number(cycleOffDays) < 1 || Number(cycleOffDays) > 30)
    ) {
      setFormError({
        cycleOffDays: "Cycle off days must be between 1 and 30."
      });
      return;
    }

    const dtoIn = {
      brandName: brandName.trim(),
      dosageStrengthValue: Number(dosageStrengthValue),
      dosageStrengthUnit,
      personalDosageValue: Number(personalDosageValue),
      scheduleType
    };

    if (genericName.trim()) {
      dtoIn.genericName = genericName.trim();
    }

    if (
      scheduleType === "DAILY" ||
      scheduleType === "WEEKLY" ||
      scheduleType === "CYCLE"
    ) {
      dtoIn.reminderTimes = reminderTimes;
    }

    if (scheduleType === "WEEKLY") {
      dtoIn.monday = weekdays.includes("MONDAY");
      dtoIn.tuesday = weekdays.includes("TUESDAY");
      dtoIn.wednesday = weekdays.includes("WEDNESDAY");
      dtoIn.thursday = weekdays.includes("THURSDAY");
      dtoIn.friday = weekdays.includes("FRIDAY");
      dtoIn.saturday = weekdays.includes("SATURDAY");
      dtoIn.sunday = weekdays.includes("SUNDAY");
    }

    if (scheduleType === "INTERVAL") {
      dtoIn.intervalHours = Number(intervalHours);
      dtoIn.intervalStartTime = intervalStartTime;
    }

    if (scheduleType === "CYCLE") {
      dtoIn.cycleOnDays = Number(cycleOnDays);
      dtoIn.cycleOffDays = Number(cycleOffDays);
    }
    if (selectedMedication) {
  dtoIn.medicationId = selectedMedication.medicationId;
}
const requestUrl = selectedMedication
  ? "http://localhost:3000/medication/update"
  : "http://localhost:3000/medication/create";
    fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dtoIn)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create medication.");
        }

        return response.json();
      })
      .then(() => {
        setActivePage("medication");
      })
      .catch((error) => {
        console.error(error);
        setFormError({
          submit: "Failed to create medication."
        });
      });
  }

  return (
    <div className="app-page">
      <h1>Take Your Meds</h1>

      <h2>MEDICATION</h2>

      <form className="medication-form" onSubmit={handleSubmit}>
        <label>Brand name</label>
        <input
          type="text"
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
        />
        {formError.brandName && (
          <p className="field-error">{formError.brandName}</p>
        )}

        <label>Generic name</label>
        <input
          type="text"
          value={genericName}
          onChange={(event) => setGenericName(event.target.value)}
        />

        <label>Dosage strength</label>
        <div className="inline-fields-row">
          <input
            type="number"
            min="0.01"
            step="any"
            value={dosageStrengthValue}
            onChange={(event) => setDosageStrengthValue(event.target.value)}
          />

          <select
            value={dosageStrengthUnit}
            onChange={(event) => setDosageStrengthUnit(event.target.value)}
          >
            <option value="mg">mg</option>
            <option value="µg">µg</option>
            <option value="IU">IU</option>
          </select>
        </div>
        {formError.dosageStrengthValue && (
          <p className="field-error">{formError.dosageStrengthValue}</p>
        )}

        <label>Personal dosage per intake</label>
        <div className="inline-fields-row">
          <input
            type="number"
            min="0.01"
            step="any"
            value={personalDosageValue}
            onChange={(event) => setPersonalDosageValue(event.target.value)}
          />

          <span>{dosageStrengthUnit}</span>
        </div>
        {formError.personalDosageValue && (
          <p className="field-error">{formError.personalDosageValue}</p>
        )}

        <label>Notification Schedule</label>
        <div className="schedule-type-row">
          <label>
            <input
              type="radio"
              name="scheduleType"
              value="DAILY"
              checked={scheduleType === "DAILY"}
              onChange={(event) => setScheduleType(event.target.value)}
            />
            Daily
          </label>

          <label>
            <input
              type="radio"
              name="scheduleType"
              value="WEEKLY"
              checked={scheduleType === "WEEKLY"}
              onChange={(event) => setScheduleType(event.target.value)}
            />
            Weekly
          </label>

          <label>
            <input
              type="radio"
              name="scheduleType"
              value="INTERVAL"
              checked={scheduleType === "INTERVAL"}
              onChange={(event) => setScheduleType(event.target.value)}
            />
            Interval
          </label>

          <label>
            <input
              type="radio"
              name="scheduleType"
              value="CYCLE"
              checked={scheduleType === "CYCLE"}
              onChange={(event) => setScheduleType(event.target.value)}
            />
            Cycle
          </label>
        </div>

        {scheduleType === "DAILY" && <></>}

        {scheduleType === "WEEKLY" && (
          <>
            <label>Weekdays</label>

            <div className="weekday-pill-row">
              {[
                { value: "MONDAY", label: "Mo" },
                { value: "TUESDAY", label: "Tu" },
                { value: "WEDNESDAY", label: "We" },
                { value: "THURSDAY", label: "Th" },
                { value: "FRIDAY", label: "Fr" },
                { value: "SATURDAY", label: "Sa" },
                { value: "SUNDAY", label: "Su" }
              ].map((day) => {
                const isSelected = weekdays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    className={
                      isSelected ? "weekday-pill selected" : "weekday-pill"
                    }
                    onClick={() => {
                      if (isSelected && weekdays.length > 1) {
                        setWeekdays(
                          weekdays.filter(
                            (weekday) => weekday !== day.value
                          )
                        );
                      }

                      if (!isSelected) {
                        setWeekdays([...weekdays, day.value]);
                      }
                    }}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {scheduleType === "INTERVAL" && (
          <div className="inline-fields-row">
            <div className="inline-field">
              <label>Interval hours</label>

              <input
                type="number"
                min="1"
                max="12"
                step="1"
                value={intervalHours}
                onChange={(event) => setIntervalHours(event.target.value)}
              />
            </div>

            <div className="inline-field">
              <label>Start time</label>

              <input
                type="time"
                value={intervalStartTime}
                className="time-input"
                onChange={(event) => setIntervalStartTime(event.target.value)}
              />
            </div>
          </div>
        )}
        {formError.intervalHours && (
          <p className="field-error">{formError.intervalHours}</p>
        )}
{scheduleType === "CYCLE" && (
  <div className="inline-fields-row">
    <div className="inline-field">
      <label>Cycle on days</label>

      <input
        type="number"
        min="1"
        max="30"
        step="1"
        value={cycleOnDays}
        onChange={(event) => setCycleOnDays(event.target.value)}
      />
    </div>

    <div className="inline-field">
      <label>Cycle off days</label>

      <input
        type="number"
        min="1"
        max="30"
        step="1"
        value={cycleOffDays}
        onChange={(event) => setCycleOffDays(event.target.value)}
      />
    </div>
  </div>
)}
        {(
          scheduleType === "DAILY" ||
          scheduleType === "WEEKLY" ||
          scheduleType === "CYCLE"
        ) && (
          <>
            <label>Reminders</label>

            {reminderTimes.map((reminderTime, index) => (
              <div className="reminder-time-row" key={index}>
                <input
                  type="time"
                  value={reminderTime}
                  className="time-input"
                  onChange={(event) => {
                    const updatedReminderTimes = [...reminderTimes];
                    updatedReminderTimes[index] = event.target.value;
                    setReminderTimes(updatedReminderTimes);
                  }}
                />

                <span>
                  {calculatedPills ? `${calculatedPills} pill(s)` : ""}
                </span>

                {index > 0 && (
                  <button
                    type="button"
                    className="reminder-delete-button"
                    onClick={() =>
                      setReminderTimes(
                        reminderTimes.filter(
                          (_, reminderIndex) => reminderIndex !== index
                        )
                      )
                    }
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}

            {reminderTimes.length < 4 && (
              <button
                type="button"
                className="add-reminder-button"
                onClick={() => setReminderTimes([...reminderTimes, "08:00"])}
              >
                <FiPlusCircle />
                Add reminder
              </button>
            )}
          </>
        )}

        {formError.submit && (
          <p className="field-error">{formError.submit}</p>
        )}

        <div className="form-buttons">
          <button type="button" onClick={() => setActivePage("medication")}>
            Cancel
          </button>

          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

export default MedicationForm;