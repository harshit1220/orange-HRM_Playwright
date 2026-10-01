const fs = require('fs');
const path = require('path');

const API_BASE = '/web/index.php/api/v2/pim';
const OUT_DIR = path.resolve(__dirname, '..', 'api-responses');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Thin wrapper over OrangeHRM's internal REST API (v2).
 * Uses the browser context's request object so the authenticated UI session cookie is reused.
 * Every response is captured: attached to the Playwright HTML report, saved to /api-responses
 * as JSON, and summarised in the console.
 */
class EmployeeApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  constructor(request, testInfo) {
    this.request = request;
    this.testInfo = testInfo;
  }

  /** Capture a response (request, status, body) in the report, on disk and in the console. */
  async record(label, res) {
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    const entry = {
      label,
      capturedAt: new Date().toISOString(),
      request: { method: 'GET', url: res.url() },
      response: { status: res.status(), statusText: res.statusText(), body },
    };
    const json = JSON.stringify(entry, null, 2);

    await this.testInfo.attach(label, { body: json, contentType: 'application/json' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, `${slugify(label)}.json`), json);
    console.log(`[API] ${label}: GET ${res.url()} -> ${res.status()}`);
    return { status: res.status(), ok: res.ok(), body };
  }

  async get(label, endpoint, params) {
    const res = await this.request.get(`${API_BASE}${endpoint}`, params ? { params } : undefined);
    const result = await this.record(label, res);
    if (!result.ok) {
      throw new Error(`${label} failed: ${result.status} ${JSON.stringify(result.body)}`);
    }
    return result.body;
  }

  /** Search employees by name or ID; returns the raw `data` array. */
  async searchEmployees(employeeId, label = 'API - employee lookup') {
    const body = await this.get(label, '/employees', { nameOrId: employeeId, limit: 50, offset: 0 });
    return body.data || [];
  }

  /** Find an employee whose employeeId matches exactly, or undefined. */
  async findByEmployeeId(employeeId, label) {
    const list = await this.searchEmployees(employeeId, label);
    return list.find((e) => e.employeeId === employeeId);
  }

  /** Job details (job title / employment status) for an empNumber. */
  async getJobDetails(empNumber, label = 'API - job details') {
    const body = await this.get(label, `/employees/${empNumber}/job-details`);
    return body.data;
  }
}

module.exports = { EmployeeApiClient };
