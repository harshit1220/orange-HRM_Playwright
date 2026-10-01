const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** Load the JSON test data and generate a unique Employee ID (max 10 chars in OrangeHRM). */
function loadTestData() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'test-data', 'employee.json'), 'utf-8'));
  const suffix = String(Date.now()).slice(-6); // 6 digits
  const employee = {
    ...raw.employee,
    employeeId: `${raw.employee.employeeIdPrefix}${suffix}`,
    profilePictureAbsolutePath: path.join(ROOT, raw.employee.profilePicture),
  };
  return { credentials: raw.credentials, employee, updatedJob: raw.updatedJob };
}

module.exports = { loadTestData };
