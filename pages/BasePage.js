const { expect } = require('@playwright/test');

class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.toast = page.locator('.oxd-toast');
    this.loader = page.locator('.oxd-form-loader, .oxd-loading-spinner');
  }

  /** Locator for the input inside an OrangeHRM form group identified by its label text. */
  inputByLabel(label) {
    return this.page.locator(`.oxd-input-group:has(label:text-is("${label}")) input`).first();
  }

  /** Locator for the OrangeHRM custom dropdown identified by its label text. */
  dropdownByLabel(label) {
    return this.page.locator(`.oxd-input-group:has(label:text-is("${label}")) .oxd-select-text`).first();
  }

  async selectDropdownOption(label, optionText) {
    await this.dropdownByLabel(label).click();
    await this.page.getByRole('option', { name: optionText, exact: true }).click();
  }

  async waitForLoaderToDisappear() {
    await expect(this.loader.first(), 'Page loader should disappear').toBeHidden({ timeout: 30_000 }).catch(() => {});
  }

  async expectToast(text) {
    await expect(this.toast.filter({ hasText: text }).first(), `Toast "${text}" should be displayed`).toBeVisible();
  }
}

module.exports = { BasePage };
