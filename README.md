# Enterprise-Level BDD Automation Framework

## 📋 Overview

This is a **production-ready, enterprise-grade BDD (Behavior-Driven Development) automation framework** built with:
- **Playwright** - Modern, reliable cross-browser automation
- **TypeScript** - Strong typing and advanced OOP concepts
- **Cucumber/Gherkin** - Business-readable test specifications
- **Page Object Model (POM)** - Maintainable and scalable test structure
- **XML Locator Management** - Centralized, dynamic element locators
- **Allure Reporting** - Beautiful HTML reports
- **Advanced Features** - Screenshots, parallel execution, retry logic, CI/CD ready

---

## 🏗️ Project Structure

```
project-root/
│
├── features/                          # Gherkin feature files
│   ├── login.feature                  # Login scenarios
│   └── search.feature                 # Product/Search scenarios
│
├── stepDefinitions/                   # Cucumber step implementations
│   ├── commonSteps.ts                 # Reusable common steps
│   ├── loginSteps.ts                  # Login-specific steps
│   └── dashboardSteps.ts              # Dashboard-specific steps
│
├── pages/                             # Page Object Model
│   ├── BasePage.ts                    # Base class with common methods
│   ├── LoginPage.ts                   # Login page object
│   ├── DashboardPage.ts               # Dashboard page object
│   └── CartPage.ts                    # Cart page object
│
├── utils/                             # Utility classes
│   ├── XMLLocatorReader.ts            # XML locator parser
│   ├── ActionHelper.ts                # Generic element actions
│   ├── ConfigReader.ts                # Environment configuration
│   └── Logger.ts                      # Logging utility
│
├── locators/                          # XML locator files
│   ├── LoginPage.xml                  # Login page locators
│   ├── DashboardPage.xml              # Dashboard locators
│   └── CartPage.xml                   # Cart page locators
│
├── hooks/                             # Cucumber hooks
│   └── hooks.ts                       # Before/After scenario hooks
│
├── test-data/                         # Test data files
│   ├── loginTestData.ts               # Login test data
│   └── productTestData.ts             # Product test data
│
├── reports/                           # Generated reports
│   ├── screenshots/                   # Failure screenshots
│   ├── videos/                        # Test execution videos
│   └── html-reports/                  # HTML reports
│
├── config/                            # Configuration files
│   └── (future use for advanced configs)
│
├── .env                               # Local environment variables
├── .env.qa                            # QA environment config
├── .env.stage                         # Staging environment config
├── .env.prod                          # Production environment config
│
├── playwright.config.ts               # Playwright configuration
├── cucumber.js                        # Cucumber configuration
├── package.json                       # npm dependencies
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BDD_Playwright
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm --version
   npx playwright --version
   npx cucumber-js --version
   ```

---

## 🧪 Running Tests

### Basic Test Execution


Execute by scenario"
=====================
"test:scenario":"npm run clean && cucumber-js --name"
npm run test:scenario "DB value in creation


Execute by Tag name:
npx cucumber-js --tags "@auth"

Excute by Env:
$env:NODE_ENV = "qa"; npx cucumber-js --tags "@auth"
$env:NODE_ENV = "qa"; npm run test:scenario "DB value in creation

$env:HEADLESS="false"; npx cucumber-js features/DummyBDD.feature

### Advanced Test Execution

```bash
# Run specific feature file
npx cucumber-js features/login.feature

# Run with specific tag
npx cucumber-js --tags "@smoke and @positive"

# Run in parallel (4 workers)
npm run test:parallel

# Run in debug mode
npm run test:debug

# Run in headed mode (see browser)
NODE_ENV=dev npm run test

# Run with slow motion (500ms)
SLOW_MO=500 npm run test
```

### Environment-Specific Execution

```bash
# QA Environment
npm run test:qa

# Staging Environment
npm run test:stage

# Production Environment (use with caution)
npm run test:prod

# Development (with debugging features)
npm run test
```

---

## 📊 Reporting

### Generate Allure Report

```bash
# Generate report
npm run allure:generate

# Open report in browser
npm run allure:open

# Generate and open
npm run report

# Clean reports
npm run allure:clean
```

### Report Locations

- **Cucumber HTML Report**: `./reports/cucumber-report.html`
- **Playwright Report**: `./playwright-report/index.html`
- **Allure Report**: `./allure-report/index.html`
- **Screenshots**: `./reports/screenshots/`
- **Videos**: `./reports/videos/`

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file for local development:

```bash
# Development
NODE_ENV=dev
BASE_URL=https://saucedemo.com
BROWSER=chromium
HEADLESS=false
SLOW_MO=500
TIMEOUT=30000
```

### Playwright Configuration

Edit `playwright.config.ts` to customize:
- Browser timeout
- Retry logic
- Screenshot/video on failure
- Viewport size
- Cross-browser testing

### Cucumber Configuration

Edit `cucumber.js` to customize:
- Feature file location
- Step definitions path
- Parallel execution
- Tags for test execution
- Report format

---

## 📝 Writing Tests

### 1. Create Feature File

Create file: `features/myfeature.feature`

```gherkin
@myfeature @smoke
Feature: My Test Feature

  Scenario: Test scenario
    Given I navigate to the application
    When I fill "username" with "testuser"
    And I click on "submitButton"
    Then I should see "Success"
```

### 2. Create Step Definitions

Create file: `stepDefinitions/mySteps.ts`

```typescript
import { When, Then } from '@cucumber/cucumber';

When('I fill {string} with {string}', async function(this: any, field: string, value: string) {
  const locator = await XMLLocatorReader.getLocator('PageName', field);
  await this.page.fill(locator, value);
});
```

### 3. Add XML Locators

Create file: `locators/PageName.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PageName>
  <username>xpath=//input[@id='user-name']</username>
  <password>xpath=//input[@id='password']</password>
  <submitButton>xpath=//button[@type='submit']</submitButton>
</PageName>
```

### 4. Create Page Object (Optional)

```typescript
import BasePage from './BasePage';

class MyPage extends BasePage {
  constructor(page: Page) {
    super(page, 'PageName');
  }

  async fillUsername(username: string): Promise<void> {
    await this.fill('username', username);
  }
}
```

---

## 🎯 Tag Usage

### Test Organization with Tags

```gherkin
@smoke           # Quick sanity tests
@regression      # Full regression suite
@positive        # Happy path tests
@negative        # Error/failure tests
@flaky           # Tests that may fail intermittently
@wip             # Work in progress
@urgent          # High priority tests
```

### Execute by Tags

```bash
# Run smoke tests
npx cucumber-js --tags "@smoke"

# Run smoke AND positive tests
npx cucumber-js --tags "@smoke and @positive"

# Run smoke OR regression
npx cucumber-js --tags "@smoke or @regression"

# Run smoke but NOT flaky
npx cucumber-js --tags "@smoke and not @flaky"
```

---

## 🔑 Key Framework Components

### 1. XMLLocatorReader

Reads and caches locators from XML files dynamically.

**Usage:**
```typescript
const locator = await XMLLocatorReader.getLocator('LoginPage', 'username');
// Returns: xpath=//input[@id='user-name']
```

### 2. ActionHelper

Provides generic element interaction methods.

**Available Methods:**
- `click(locator)` - Click element
- `fill(locator, value)` - Fill text field
- `type(locator, value)` - Type character by character
- `getText(locator)` - Get element text
- `isVisible(locator)` - Check visibility
- `waitForElement(locator)` - Wait for element
- `selectDropdown(locator, value)` - Select dropdown option
- `takePageScreenshot(filename)` - Capture page screenshot
- And many more...

### 3. BasePage

Parent class for all page objects providing:
- Dynamic XML locator loading
- Reusable element interaction methods
- Consistent logging
- Error handling
- Screenshot capability

### 4. ConfigReader

Manages environment configuration:
- Load `.env` files based on NODE_ENV
- Provides easy config access
- Support for multiple environments

### 5. Hooks

Cucumber lifecycle management:
- BeforeAll - Launch browser once
- Before - Create page for each scenario
- After - Close page, take failure screenshots
- AfterAll - Close browser

---

## 💡 Best Practices

### 1. Locator Management
- Keep all locators in XML files
- Use meaningful locator names
- Use XPath for complex locators
- Document complex selectors

### 2. Test Data
- Centralize test data in files
- Avoid hardcoding values
- Use test data factories
- Keep sensitive data in .env

### 3. Page Objects
- One page = one class
- Keep page logic separate from steps
- Reuse common methods via BasePage
- Name methods after business actions

### 4. Step Definitions
- Write steps in business language
- Keep steps simple and focused
- Reuse common steps
- Follow Given-When-Then pattern

### 5. Error Handling
- Use try-catch in hooks
- Log failures with context
- Take screenshots on failure
- Attach logs to reports

### 6. CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: BDD Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
      - run: npm run allure:generate
```

---

## 🐛 Debugging

### Debug Mode

```bash
# Run with detailed logging
npm run test:debug

# Run with breakpoints (Node inspector)
node --inspect-brk node_modules/.bin/cucumber-js
```

### Browser Inspector

```bash
# Run in headed mode to see browser
NODE_ENV=dev npm run test

# Slow down execution
SLOW_MO=2000 npm run test
```

### View Generated Reports

```bash
# Open HTML report
npm run report

# Check screenshots
open reports/screenshots/

# View videos
open reports/videos/
```

---

## 📦 Dependencies Overview

| Package | Purpose |
|---------|---------|
| `@playwright/test` | Cross-browser automation |
| `@cucumber/cucumber` | BDD framework |
| `typescript` | Static typing |
| `xml2js` | XML parsing |
| `dotenv` | Environment management |
| `allure-cucumberjs` | Reporting |
| `ts-node` | TypeScript execution |

---

## 🔄 CI/CD Integration

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npx playwright install
CMD ["npm", "run", "test"]
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }
        stage('Report') {
            steps {
                sh 'npm run allure:generate'
            }
        }
    }
}
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber Documentation](https://cucumber.io/)
- [Gherkin Syntax Guide](https://cucumber.io/docs/gherkin/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Allure Report](https://docs.qameta.io/allure/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Write tests and code
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

---

## 📞 Support

For issues, questions, or contributions, please create an issue in the repository.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Happy Testing!

Built with ❤️ for enterprise automation.

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Framework Author**: Senior Automation Architect


Jenkins:
748d06ce8313470b9a01915afce9df7f


TO open Allure Report directly:
npx allure-commandline open "C:\Users\Saddam\Downloads\allure-report\allure-report"