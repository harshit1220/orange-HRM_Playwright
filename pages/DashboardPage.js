const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
  }

  async expectLoaded() {
    await expect(this.page, 'URL should point to the dashboard after login').toHaveURL(/dashboard\/index/);
    await expect(this.heading, 'Dashboard heading should be visible after successful login').toBeVisible();
  }

  async openPim() {
    await this.pimMenu.click();
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }
}

module.exports = { DashboardPage };
