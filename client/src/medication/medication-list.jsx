import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import BottomNavbar from "../common/bottom-navbar";

function MedicationList({ setActivePage, setSelectedMedication }) {
  const [medicationList, setMedicationList] = useState([]);
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/medication/list")
      .then((response) => response.json())
      .then((data) => {
        setMedicationList(data.medicationList || []);
      });
  }, []);
function deleteMedication() {
  fetch("http://localhost:3000/medication/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      medicationId: medicationToDelete.medicationId
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete medication.");
      }

      return response.json();
    })
    .then(() => {
      setMedicationList((currentList) =>
        currentList.filter(
          (medication) =>
            medication.medicationId !== medicationToDelete.medicationId
        )
      );

      setMedicationToDelete(null);
    })
    .catch((error) => {
      console.error(error);
    });
}
  return (
      <div className="app-page">
      <h1>Take Your Meds</h1>

      <ul>
        <li
  className="add-medication-item"
  onClick={() => {
    setSelectedMedication(null);
    setActivePage("medication-form");
  }}
>
  + Add Medication
</li>
        {medicationList.map((medication) => (
          <li
  key={medication.medicationId}
  className="medication-item"
  onClick={() => {
    setSelectedMedication(medication);
    setActivePage("medication-form");
  }}
>
            <div>
              <strong>
                {medication.brandName} {medication.dosageStrengthValue}{" "}
                {medication.dosageStrengthUnit}
              </strong>

              <br />

              {medication.genericName}
            </div>

            <button
  className="delete-button"
  onClick={(event) => {
    event.stopPropagation();
    setMedicationToDelete(medication);
  }}
>
  <FiTrash2 />
</button>
          </li>
        ))}
      </ul>

{medicationToDelete && (
  <div className="modal-backdrop">
    <div className="modal">
      <p>
  Are you sure you want to delete{" "}
  <strong>
    {medicationToDelete.brandName}{" "}
    {medicationToDelete.dosageStrengthValue}{" "}
    {medicationToDelete.dosageStrengthUnit}
  </strong>
  ?
</p>

<p>
  Deleting this medication will also remove all related reminders.
</p>

     <div className="modal-buttons">
  <button
    className="modal-button cancel"
    onClick={() => setMedicationToDelete(null)}
  >
    Cancel
  </button>

  <button
  className="modal-button delete"
  onClick={() => deleteMedication()}
>
  Delete
</button>
</div>
    </div>
  </div>
)}
      <BottomNavbar
  activePage="medication"
  setActivePage={setActivePage}
/>
    </div>
  );
}

export default MedicationList;