const fs = require("fs");
const path = require("path");

// Folder: server/dao/storage/medicationList
const medicationFolderPath = path.join(__dirname, "storage", "medicationList");

// Ensure folder exists
if (!fs.existsSync(medicationFolderPath)) {
  fs.mkdirSync(medicationFolderPath, { recursive: true });
}

class MedicationDao {
  create(medication) {
    const filePath = path.join(
      medicationFolderPath,
      `${medication.medicationId}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(medication, null, 2), "utf8");
    return medication;
  }

  list() {
    const files = fs.readdirSync(medicationFolderPath);

    const medicationList = files.map((file) => {
      const content = fs.readFileSync(
        path.join(medicationFolderPath, file),
        "utf8"
      );
      return JSON.parse(content);
    });

    return { medicationList };
  }

  update(medication) {
    const filePath = path.join(
      medicationFolderPath,
      `${medication.medicationId}.json`
    );

    if (!fs.existsSync(filePath)) return null;

    fs.writeFileSync(filePath, JSON.stringify(medication, null, 2), "utf8");
    return medication;
  }

  delete(medicationId) {
    const filePath = path.join(
      medicationFolderPath,
      `${medicationId}.json`
    );

    if (!fs.existsSync(filePath)) return;

    fs.unlinkSync(filePath);
  }
}

module.exports = new MedicationDao();
