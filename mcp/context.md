# BDD Playwright TypeScript Framework - Comprehensive Context

## FRAMEWORK ARCHITECTURE

### Core Stack
- **Language**: TypeScript (ES2020)
- **Test Framework**: Playwright + Cucumber (BDD)
- **Architecture Pattern**: Page Object Model (POM)
- **Locators**: Centralized JSON-based
- **Database Support**: MySQL + MSSQL integration
- **Reporting**: Allure Reports + Cucumber HTML
- **Execution**: Parallel support (4 workers)
- **Environment Management**: .env based configuration

### Folder Structure
```
features/              → .feature files (Gherkin scenarios)
stepDefinitions/       → Step implementations (Given/When/Then)
pages/                 → Page Object Model classes
hooks/                 → Lifecycle hooks (Before/After/BeforeAll/AfterAll)
locators/              → Centralized locator definitions (JSON)
test-data/             → Test data in TypeScript objects
api/                   → API client, service, builder, endpoints
database/              → Database client and query manager
utils/                 → Helper utilities and common functions
config/                → Environment configuration
Actions/               → Common action functions
reports/               → Generated reports
```

---

## GENERATION RULES & PRINCIPLES

### Rule 1: Analyze Before Generate
- Always check existing code in stepDefinitions/, pages/, and test-data/ folders
- Search for existing steps with similar functionality
- Detect duplicate patterns to prevent code redundancy

### Rule 2: Reuse Existing Components
✓ **Existing Reusable Steps** (from commonSteps.ts):
- `"I click on {string}"` - Clicks element by locator name
- `"User enter {string} in {string}"` - Enters text in field with context variable support ($VariableName)
- `"User is on the application"` - Navigates to base URL

✓ **Existing Utilities**:
- LocatorUtil.getLocator(locatorName) - Fetches locator by name
- Logger utility - For all logging (info, success, error, debug)
- ScenarioContext - For storing and retrieving dynamic test data
- ActionHelper - Generic click, fill, getText, verify methods
- BasePage - Base class for all page objects

### Rule 3: Locator Management
**Pattern**: Centralized JSON (locators/locators.json)

**Locator Types Supported**:
- `"css"` - CSS selectors
- `"xpath"` - XPath expressions
- `"text"` - Text-based selection
- `"role"` - Playwright accessibility roles

**Example Structure**:
```json
{
  "loginPage": {
    "usernameInput": {"type": "css", "value": "input[type='text']"},
    "passwordInput": {"type": "css", "value": "input[type='password']"},
    "loginButton": {"type": "xpath", "value": "//button[text()='Login']"},
    "errorMessage": {"type": "text", "value": "Invalid Credentials"}
  }
}
```

### Rule 4: Step Definition Pattern
**Location**: stepDefinitions/<featureName>Steps.ts

**Template**:
```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { Logger } from "../utils/Logger";
import { ScenarioContext } from "../utils/scenarioContext";

When("step description {string}", async function (param: string) {
  Logger.info(`Starting step with param: ${param}`);
  try {
    // Implementation using this.page
    Logger.success(`Step completed successfully`);
  } catch (error) {
    Logger.error(`Step failed: ${error}`);
    throw error;
  }
});
```

**Key Points**:
- Use `async` functions
- Always log using Logger (info, success, error)
- Access page via `this.page` (provided by hooks)
- Use LocatorUtil for locators
- Use ScenarioContext for dynamic values
- Use try-catch for error handling

### Rule 5: Page Object Model Pattern
**Location**: pages/<PageName>Page.ts

**Template**:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';
import { LocatorUtil } from '../utils/LocatorUtil';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async enterUsername(username: string): Promise<void> {
    Logger.info(`Entering username: ${username}`);
    const locator = LocatorUtil.getLocator('usernameInput');
    await this.page.locator(locator.value).fill(username);
    Logger.success(`Username entered successfully`);
  }

  async verifyLoginPageLoaded(): Promise<void> {
    Logger.info(`Verifying login page is loaded`);
    const locator = LocatorUtil.getLocator('loginForm');
    await this.page.locator(locator.value).waitFor({ state: 'visible' });
    Logger.success(`Login page verified`);
  }
}
```

**Key Points**:
- Extend BasePage
- Constructor requires Page object
- All methods are async
- Use LocatorUtil for locators
- Include Logger statements
- One responsibility per method

### Rule 6: Test Data Organization
**Location**: test-data/<FeatureName>TestData.ts

**Template**:
```typescript
export const validCredentials = {
  username: 'standard_user',
  password: 'secret_sauce',
  expectedResult: 'success'
};

export const invalidCredentials = {
  username: 'invalid_user',
  password: 'wrong_password',
  expectedError: 'Username and password do not match'
};
```

**Key Points**:
- Export typed objects
- Group related data together
- Use descriptive names
- Match step parameter names

### Rule 7: Context Variable Pattern
**Dynamic Values in Steps**:
- Prefix with `$` in feature files: `"User enter "$username" in "loginUsername"`
- Retrieved from ScenarioContext automatically
- Set in previous steps or test data
- Logged for debugging

**Example**:
```typescript
// Set context
ScenarioContext.set('username', 'testuser@example.com');

// Use in step
// Feature: User enter "$username" in "emailField"
// Step automatically retrieves from context
```

### Rule 8: Hooks Lifecycle
**BeforeAll**: Runs once - initializes browser instance
**Before**: Runs before each scenario - creates new page context
**After**: Runs after each scenario - captures screenshot on failure, clears context
**AfterAll**: Runs once - closes browser

**API Test Detection**: Scenarios starting with "api_" skip browser initialization

### Rule 9: Logger Implementation
**All logging must use Logger utility**:
```typescript
Logger.info("Starting action");      // Informational
Logger.success("Action completed");  // Success confirmation
Logger.error("Error occurred", err); // Error with details
Logger.debug("Debug info", data);    // Debug information
```

### Rule 10: Error Handling Standard
- Always wrap implementations in try-catch
- Log errors with context
- Throw error after logging
- Include meaningful error messages

### Rule 11: Naming Conventions

| Component | Pattern | Example |
|-----------|---------|---------|
| Feature files | `<feature-name>.feature` | `login.feature`, `api.feature` |
| Step definitions | `*Steps.ts` | `loginSteps.ts`, `commonSteps.ts` |
| Page classes | `*Page.ts` | `LoginPage.ts`, `DashboardPage.ts` |
| Test data | `*TestData.ts` | `loginTestData.ts`, `productTestData.ts` |
| Methods (steps) | camelCase with descriptive verb | `enterUsername()`, `verifyLoginForm()` |
| Constants | UPPER_SNAKE_CASE | `TIMEOUT_MS`, `BASE_URL` |
| Variables | camelCase | `userName`, `userEmail` |

### Rule 12: TypeScript Configuration
- Strict mode enabled
- Target ES2020
- Module resolution: node
- Async/await required (no callbacks)
- Type definitions for all parameters

### Rule 13: Wait Handling
**No Hardcoded Waits**:
- ✗ `await page.waitForTimeout(1000)` - FORBIDDEN
- ✓ Use Playwright's auto-wait: `await element.click()`
- ✓ Use explicit waits: `await element.waitFor({ state: 'visible' })`
- ✓ Use actionability checks built into Playwright

### Rule 14: API Testing Pattern
**Existing API Steps Available** (from apiSteps.ts):
- `"user sets method {string}"` - Set HTTP method (GET, POST, etc.)
- `"user sets endpoint from config {string}"` - Set endpoint URL
- Request payload management
- Response assertion and storage

**API Test Identification**: Feature name starts with "api_"

### Rule 15: Database Integration
**Available in dbsteps.ts**:
- Query execution steps
- Result storage in context
- MySQL and MSSQL support
- Query manager for centralized queries

---

## EXISTING COMPONENTS INVENTORY

### Available Step Definitions
**commonSteps.ts**:
- `I click on {string}` - Click by locator name
- `User enter {string} in {string}` - Enter text with context variable support
- `User is on the application` - Navigate to base URL

**apiSteps.ts**:
- `user sets method {string}` - Set HTTP method
- `user sets endpoint from config {string}` - Set endpoint
- Response parsing and assertions

**dbsteps.ts**:
- Database query execution
- Result handling and storage

### Available Page Objects
- BasePage.ts only (base class)
- LoginPage, DashboardPage, etc. are generated as needed

### Available Utilities
- Logger - Logging utility
- LocatorUtil - Locator retrieval
- ScenarioContext - Test data context
- ActionHelper - Generic UI actions
- ConfigReader - Configuration management
- EndpointManager - API endpoints
- PayloadManager - API payloads

### Available Test Data Files
- loginTestData.ts with validUsers, invalidUsers, emptyFields arrays

### Available Locators
- locators.json with: loginButton, usernameTextbox, passwordTextbox, signinButton, Dropdowncountry

---

## GENERATION REQUIREMENTS TEMPLATE

When generating test cases, ensure:

### 1. Feature File
- ✓ Create under features/ folder
- ✓ Use @smoke, @auth, @regression, @api tags
- ✓ Include scenario name and description
- ✓ Use existing steps where possible
- ✓ Parameterize values with {string}, {int}, etc.

### 2. Step Definitions
- ✓ Check if similar steps exist before creating
- ✓ Use camelCase naming for methods
- ✓ Import Logger and use consistently
- ✓ Use try-catch for error handling
- ✓ Support dynamic values with $ prefix

### 3. Page Objects
- ✓ Extend BasePage
- ✓ One method per action
- ✓ Constructor with Page parameter
- ✓ Use LocatorUtil for all locators
- ✓ Include Logger statements

### 4. Test Data
- ✓ Export typed objects
- ✓ Group related data
- ✓ Use descriptive names
- ✓ Match feature file parameter names

### 5. Locators
- ✓ Add to locators.json
- ✓ Group by page (loginPage, dashboardPage, etc.)
- ✓ Specify type (css, xpath, text, role)
- ✓ Use reliable selectors

### 6. Configuration
- ✓ Use env.ts for base URL
- ✓ ConfigReader for browser settings
- ✓ Environment-based endpoints in api/config/

---

## SCENARIO GENERATION TASK

**Scenario**: User logs into application with valid credentials and verifies dashboard page.

**Required Generation**:
1. Feature file: features/login.feature
2. Step definitions: stepDefinitions/loginSteps.ts (new steps only)
3. Page objects: pages/LoginPage.ts, pages/DashboardPage.ts
4. Test data: test-data/loginTestData.ts (if not exists, extend)
5. Locators: Update locators/locators.json
6. Reuse: commonSteps existing steps