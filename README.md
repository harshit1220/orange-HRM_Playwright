# OrangeHRM – Employee Lifecycle Automation (Playwright + JavaScript)

End-to-end UI + API automation of the **Employee Lifecycle Management** scenario on
<https://opensource-demo.orangehrmlive.com/> using Playwright Test and the Page Object Model.

## Scenario covered (single serial test, one `test.step` per stage)
1. **Login** (`Admin` / `admin123`) and verify the dashboard.
2. **Add employee** via PIM > Add Employee using data from `test-data/employee.json` (first/last name, unique Employee ID, profile picture) and verify the success toast + saved record.
3. **Edit employee**: search by Employee ID, update Job Title and Employment Status, reload and verify.
4. **Validate via API**: call OrangeHRM's REST API (`/web/index.php/api/v2/pim/...`) with the logged-in session and cross-check ID, name, job title and employment status against the UI.
5. **Delete employee** from the UI; verify via UI search (no record) and via API (not returned).
6. **Logout**; verify redirect to login, protected page redirects to login, and the API rejects the old session.

## Prerequisites
- Node.js 18+ (tested with Node 22) and npm
- Internet access to `opensource-demo.orangehrmlive.com`

## Setup
```bash
npm install
npx playwright install chromium     # or: npm run install:browsers
```

## Run
```bash
npm test                # headless; generates HTML report, video and screenshots
npm run test:headed     # watch the browser
npm run report          # open the HTML report
```
After `npm test`, `scripts/collect-video.js` copies the recorded video to `videos/employee-lifecycle-run.webm`.

## Outputs
| Output | Location |
|---|---|
| HTML report | `playwright-report/index.html` (videos/screenshots are embedded) |
| API responses | Attached to each API step in the HTML report, and saved as JSON in `api-responses/` |
| Test run video | `videos/employee-lifecycle-run.webm` (raw: `test-results/**/video.webm`) |

## Framework structure
```
.
├── pages/                     # Page Objects
│   ├── BasePage.js            # shared locators/helpers (labels, dropdowns, toasts)
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── AddEmployeePage.js
│   ├── EmployeeListPage.js
│   └── EmployeeJobPage.js
├── utils/
│   ├── apiClient.js           # OrangeHRM REST API wrapper (reuses UI session)
│   └── testData.js            # loads JSON data, generates unique Employee ID
├── test-data/
│   ├── employee.json          # data-driven input
│   └── images/profile-picture.png
├── tests/employee-lifecycle.spec.js
├── api-responses/             # captured API request/response JSON (generated on run)
├── scripts/collect-video.js
├── playwright.config.js       # runner, reporter, video, timeouts
└── package.json
```

## Design notes
- **Unique data:** Employee ID = prefix from JSON + 6 time-based digits, so reruns never collide (the public demo is shared and resets periodically).
- **API step:** uses the real OrangeHRM API through the authenticated browser context, so the check reflects the exact employee created in the UI. (ReqRes cannot see this employee.)
- **Assertions** carry descriptive messages to make report failures self-explanatory.

## Dependencies
- [`@playwright/test`](https://playwright.dev) `^1.49.0` (runner, assertions, HTML reporter, video, API request context)
- Node.js built-ins (`fs`, `path`)

## Notes
- The public demo site can be slow or briefly unavailable; timeouts are generous (180 s test, 60 s navigation).
