const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class EmployeeJobPage extends BasePage {
  constructor(page) {
    super(page);
    this.jobTab = page.getByRole('link', { name: 'Job', exact: true });
    this.heading = page.getByRole('heading', { name: 'Job Details' });
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();
  }

  async openJobTab() {
    await this.jobTab.click();
    await expect(this.heading, 'Job Details section should be displayed').toBeVisible();
    await this.waitForLoaderToDisappear();
  }

  async updateJob({ jobTitle, employmentStatus }) {
    await this.selectDropdownOption('Job Title', jobTitle);
    await this.selectDropdownOption('Employment Status', employmentStatus);
    await this.saveButton.click();
    await this.expectToast('Successfully Updated');
  }

  async expectJob({ jobTitle, employmentStatus }) {
    await expect(this.dropdownByLabel('Job Title'), 'Job Title should show the updated value').toHaveText(jobTitle);
    await expect(this.dropdownByLabel('Employment Status'), 'Employment Status should show the updated value').toHaveText(employmentStatus);
  }

  /** Read current values from the UI for API cross-checking. */
  async readJob() {
    return {
      jobTitle: (await this.dropdownByLabel('Job Title').innerText()).trim(),
      employmentStatus: (await this.dropdownByLabel('Employment Status').innerText()).trim(),
    };
  }
}

module.exports = { EmployeeJobPage };
