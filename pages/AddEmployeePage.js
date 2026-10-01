const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class AddEmployeePage extends BasePage {
  constructor(page) {
    super(page);
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
    this.addEmployeeTab = page.getByRole('link', { name: 'Add Employee' });
    this.heading = page.getByRole('heading', { name: 'Add Employee' });
    this.firstName = page.locator('input[name="firstName"]');
    this.middleName = page.locator('input[name="middleName"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.photoInput = page.locator('input[type="file"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async navigate() {
    await this.pimMenu.click();
    await this.addEmployeeTab.click();
    await expect(this.heading, 'Add Employee form should be displayed').toBeVisible();
  }

  /**
   * Fills the form and saves.
   * @returns {Promise<string>} the system-generated empNumber parsed from the resulting URL
   */
  async addEmployee({ firstName, middleName, lastName, employeeId, profilePictureAbsolutePath }) {
    await this.firstName.fill(firstName);
    if (middleName) await this.middleName.fill(middleName);
    await this.lastName.fill(lastName);
    await this.photoInput.setInputFiles(profilePictureAbsolutePath);

    const idInput = this.inputByLabel('Employee Id');
    await idInput.fill(employeeId);
    await expect(idInput, 'Employee Id field should hold the generated ID').toHaveValue(employeeId);

    await this.saveButton.click();
    await this.expectToast('Successfully Saved');
    await this.page.waitForURL(/pim\/viewPersonalDetails\/empNumber\/\d+/);
    const match = this.page.url().match(/empNumber\/(\d+)/);
    expect(match, 'empNumber should be present in the URL after saving').not.toBeNull();
    return match[1];
  }
}

module.exports = { AddEmployeePage };
