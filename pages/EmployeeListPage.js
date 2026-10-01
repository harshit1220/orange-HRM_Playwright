const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class EmployeeListPage extends BasePage {
  constructor(page) {
    super(page);
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
    this.employeeListTab = page.getByRole('link', { name: 'Employee List' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.rows = page.locator('.oxd-table-card');
    this.noRecordsToast = page.locator('.oxd-toast').filter({ hasText: 'No Records Found' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
  }

  async navigate() {
    await this.pimMenu.click();
    await this.employeeListTab.click();
    await expect(this.page, 'Employee list page should be displayed').toHaveURL(/pim\/viewEmployeeList/);
  }

  async searchByEmployeeId(employeeId) {
    const idInput = this.inputByLabel('Employee Id');
    await idInput.fill(employeeId);
    await this.searchButton.click();
    await this.waitForLoaderToDisappear();
  }

  rowFor(employeeId) {
    return this.rows.filter({ has: this.page.getByText(employeeId, { exact: true }) });
  }

  async expectEmployeeInResults(employeeId, { firstName, lastName }) {
    const row = this.rowFor(employeeId);
    await expect(row, `Employee ${employeeId} should appear in the search results`).toHaveCount(1);
    await expect(row, 'Result row should show the employee first name').toContainText(firstName);
    await expect(row, 'Result row should show the employee last name').toContainText(lastName);
    return row;
  }

  async expectEmployeeAbsent(employeeId) {
    await expect(this.rowFor(employeeId), `Employee ${employeeId} should not be listed after deletion`).toHaveCount(0);
  }

  /** Opens the employee record (personal details) from the search result. */
  async openEmployee(employeeId) {
    await this.rowFor(employeeId).locator('.oxd-table-cell').nth(2).click();
    await this.page.waitForURL(/pim\/viewPersonalDetails\/empNumber\/\d+/);
  }

  async deleteEmployee(employeeId) {
    await this.rowFor(employeeId).locator('button:has(i.bi-trash)').click();
    await expect(this.confirmDeleteButton, 'Delete confirmation dialog should appear').toBeVisible();
    await this.confirmDeleteButton.click();
    await this.expectToast('Successfully Deleted');
  }
}

module.exports = { EmployeeListPage };
