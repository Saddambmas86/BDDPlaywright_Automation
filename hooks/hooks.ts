import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import ConfigReader from '../utils/ConfigReader';
import * as fs from 'fs';
import * as path from 'path';

// Global variables to store browser and page instances
let browser: Browser;
let context: BrowserContext;

/**
 * Hooks Configuration
 * 
 * These hooks are executed at different stages of test execution:
 * - BeforeAll: Runs once before all tests
 * - Before: Runs before each scenario
 * - After: Runs after each scenario (cleanup and screenshot on failure)
 * - AfterAll: Runs once after all tests
 * 
 * Usage:
 * - These hooks are automatically invoked by Cucumber
 * - They manage browser lifecycle and provide screenshots on failure
 */

/**
 * Before All Hook - Runs once before all tests
 * Initialize browser instance
 */
BeforeAll(async function() {
  console.log(`
🌟════════════════════════════════════════════════🌟
        🎭 Starting BDD Test Execution
🌟════════════════════════════════════════════════🌟
`);

  // Print configuration
  ConfigReader.printConfig();

  // Launch browser based on configuration
  const browserName = ConfigReader.getBrowser().toLowerCase();
  
  switch (browserName) {
    case 'firefox':
      browser = await firefox.launch({
        headless: ConfigReader.isHeadless(),
        slowMo: ConfigReader.getSlowMo(),
      });
      break;
    case 'webkit':
      browser = await webkit.launch({
        headless: ConfigReader.isHeadless(),
        slowMo: ConfigReader.getSlowMo(),
      });
      break;
    case 'chromium':
    default:
      browser = await chromium.launch({
        headless: ConfigReader.isHeadless(),
        slowMo: ConfigReader.getSlowMo(),
      });
  }

  // console.log(`✓ Browser launched: ${browserName}\n`);
});

/**
 * Before Hook - Runs before each scenario
 * Create new browser context and page for each test
 * Skip browser launch for API test scenarios (name starts with "api_")
 */
Before(async function(this: any, scenario: any) {
  // Get scenario name safely
  const scenarioName = scenario?.pickle?.name || scenario?.name || 'Unknown Scenario';
  
  console.log(`
🌟════════════════════════════════════════════════🌟
        📋 Scenario: ${scenarioName}
🌟════════════════════════════════════════════════🌟
`);

  // Check if this is an API test (scenario name starts with "api_")
  if (scenarioName.toLowerCase().startsWith('api_')) {
    console.log(`📡 API Test detected - Skipping browser launch\n`);
    this.isApiTest = true;
    return;
  }

  this.isApiTest = false;

  try {
    // Create new context with options
    context = await browser.newContext({
      // Record video for failed tests
      recordVideo: {
        dir: './reports/videos',
      },
    });

    // Create new page
    const page: Page = await context.newPage();

    // Set default navigation timeout
    page.setDefaultTimeout(ConfigReader.getTimeout());
    page.setDefaultNavigationTimeout(ConfigReader.getTimeout());

    // Attach page to world context (Cucumber's 'this' object)
    this.page = page;

    console.log(`✓ Page created and ready for test\n`);
  } catch (error) {
    console.error(`❌ Error in Before hook: ${(error as Error).message}`);
    throw error;
  }
});

/**
 * After Hook - Runs after each scenario
 * Close browser context and take screenshot on failure
 * Skip browser cleanup for API test scenarios
 */
After(async function(this: any, scenario: any) {
  // Get scenario name and status safely
  const scenarioName = scenario?.pickle?.name || scenario?.name || 'Unknown Scenario';
  const status = scenario?.result?.status || 'UNKNOWN';

  // console.log(`\n══════════════════════════════════════════════════════╗`);
  // console.log(`📊 Scenario Result: ${status}                            ║`);                       
  // console.log(`══════════════════════════════════════════════════════╝`);

console.log(`
🌟════════════════════════════════════════════════🌟
        📊 Scenario Result: ${status}
🌟════════════════════════════════════════════════🌟
`);

  try {
    // Skip browser cleanup for API tests
    if (this.isApiTest) {
      console.log(`📡 API Test completed - No browser cleanup needed\n`);
      return;
    }

    // Take screenshot on failure
    if (status === Status.FAILED) {
      console.log('\n❌ Test Failed - Taking screenshot...');

      try {
        // Create screenshot directory if it doesn't exist
        const screenshotDir = './reports/screenshots';
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // Generate screenshot filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = `${scenarioName
          .replace(/\s+/g, '_')
          .toLowerCase()}_${timestamp}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);

        // Take screenshot
        if (this.page) {
          await this.page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`✓ Screenshot saved: ${screenshotPath}`);

          // Attach screenshot to Allure report
          // Note: This requires allure-cucumberjs to be properly configured
          await (this as any).attach(
            fs.readFileSync(screenshotPath),
            'image/png'
          );
        }
      } catch (screenshotError) {
        console.error('Error taking screenshot:', (screenshotError as Error).message);
      }
    } else if (status === Status.PASSED) {
      console.log(`✅ Test Passed`);
    }

    // Close page
    if (this.page) {
      await this.page.close();
      console.log(`✓ Page closed`);
    }

    // Close context
    if (context) {
      await context.close();
      console.log(`✓ Context closed`);
    }
  } catch (error) {
    console.error(`❌ Error in After hook: ${(error as Error).message}`);
  }

  console.log(`═══════════════════════════════════════════════════════\n`);
});

/**
 * After All Hook - Runs once after all tests
 * Close browser instance
 */
AfterAll(async function() {
  // Close browser
  if (browser) {
    await browser.close();
    console.log(`✓ Browser closed`);
  }


console.log(`
🌟════════════════════════════════════════════════🌟
        ✅ TEST EXECUTION COMPLETED SUCCESSFULLY
🌟════════════════════════════════════════════════🌟
`);


  // console.log('\n\n╔════════════════════════════════════════════╗');
  // console.log('║    ✅ Test Execution Completed             ║');
  // console.log('╚════════════════════════════════════════════╝\n');
});
