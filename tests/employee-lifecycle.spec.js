const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { AddEmployeePage } = require('../pages/AddEmployeePage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');
const { EmployeeJobPage } = require('../pages/EmployeeJobPage');
const { EmployeeApiClient } = require('../utils/apiClient');
const { loadTestData } = require('../utils/testData');

const { credentials, employee, updatedJob } = loadTestData();

test.describe('OrangeHRM - Employee Lifecycle Management', () => {
  test('Login -> Add -> Edit -> API validate -> Delete -> Logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const addEmployee = new AddEmployeePage(page);
    const employeeList = new EmployeeListPage(page);
    const jobPage = new EmployeeJobPage(page);
    const api = new EmployeeApiClient(page.context().request, test.info());

    let empNumber;
    let uiJob;

    await test.step('1. Login with valid credentials and verify dashboard', async () => {
      await loginPage.goto();
      await loginPage.login(credentials.username, credentials.password);
      await dashboard.expectLoaded();
    });

    await test.step('2. PIM > Add Employee using data-driven input and profile picture', async () => {
      await addEmployee.navigate();
      empNumber = await addEmployee.addEmployee(employee);
      await expect(
        page.locator('.orangehrm-edit-employee-name'),
        'Saved employee full name should be shown on the record'
      ).toContainText(employee.firstName);
    });

    await test.step('3. Search by Employee ID and edit Job Title / Employment Status', async () => {
      await employeeList.navigate();
      await employeeList.searchByEmployeeId(employee.employeeId);
      await employeeList.expectEmployeeInResults(employee.employeeId, employee);
      await employeeList.openEmployee(employee.employeeId);
      await jobPage.openJobTab();
      await jobPage.updateJob(updatedJob);

      await page.reload();
      await jobPage.waitForLoaderToDisappear();
      await jobPage.expectJob(updatedJob);
      uiJob = await jobPage.readJob();
    });

    await test.step('4. Validate employee via OrangeHRM API and cross-check with UI', async () => {
      const apiEmployee = await api.findByEmployeeId(employee.employeeId, 'API - employee lookup (after edit)');
      expect(apiEmployee, `API should return employee ${employee.employeeId}`).toBeTruthy();
      expect(String(apiEmployee.empNumber), 'API empNumber should match the UI URL').toBe(String(empNumber));
      expect(apiEmployee.firstName, 'API first name should match UI input').toBe(employee.firstName);
      expect(apiEmployee.lastName, 'API last name should match UI input').toBe(employee.lastName);

      const job = await api.getJobDetails(empNumber, 'API - job details (after edit)');
      expect(job.jobTitle?.title, 'API job title should match the value shown in UI').toBe(uiJob.jobTitle);
      expect(job.empStatus?.name, 'API employment status should match the value shown in UI').toBe(uiJob.employmentStatus);
    });

    await test.step('5. Delete the employee and verify via UI and API', async () => {
      await employeeList.navigate();
      await employeeList.searchByEmployeeId(employee.employeeId);
      await employeeList.expectEmployeeInResults(employee.employeeId, employee);
      await employeeList.deleteEmployee(employee.employeeId);

      await employeeList.searchByEmployeeId(employee.employeeId);
      await employeeList.expectEmployeeAbsent(employee.employeeId);

      const apiEmployee = await api.findByEmployeeId(employee.employeeId, 'API - employee lookup (after delete)');
      expect(apiEmployee, `API should no longer return employee ${employee.employeeId}`).toBeUndefined();
    });

    await test.step('6. Logout and confirm the session is invalidated', async () => {
      await dashboard.logout();
      await loginPage.expectOnLoginPage();

      // Protected page must redirect to login
      await page.goto('/web/index.php/pim/viewEmployeeList');
      await loginPage.expectOnLoginPage();

      // Protected API must reject the now-invalid session (no redirect following)
      const res = await page.context().request.get('/web/index.php/api/v2/pim/employees', { maxRedirects: 0 });
      await api.record('API - request after logout (expected rejected)', res);
      expect(res.ok(), `API should reject requests after logout (got ${res.status()})`).toBeFalsy();
    });
  });
});
