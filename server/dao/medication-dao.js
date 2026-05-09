const fs = require("fs");
const path = require("path");

const medicationFolderPath = path.join(__dirname, "storage", "medicationList");

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

  get(medicationId) {
    const filePath = path.join(
      medicationFolderPath,
      `${medicationId}.json`
    );

    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  }

  list() {
    const files = fs.readdirSync(medicationFolderPath);

    return files.map((file) => {
      const content = fs.readFileSync(
        path.join(medicationFolderPath, file),
        "utf8"
      );

      return JSON.parse(content);
    });
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

    if (!fs.existsSync(filePath)) return null;

    fs.unlinkSync(filePath);
    return true;
  }
}

module.exports = new MedicationDao();