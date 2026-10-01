const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.loginHeading = page.getByRole('heading', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
    await expect(this.loginHeading, 'Login page should be displayed').toBeVisible();
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectOnLoginPage() {
    await expect(this.page, 'User should be redirected to the login page').toHaveURL(/auth\/login/);
    await expect(this.loginButton, 'Login button should be visible on the login page').toBeVisible();
  }
}

module.exports = { LoginPage };
