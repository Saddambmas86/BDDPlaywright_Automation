import { When, Given, Then } from "@cucumber/cucumber";
import { LocatorUtil } from "../utils/LocatorUtil";
import { Logger } from "../utils/Logger";
import { BasePage } from "../pages/BasePage";
import { env } from "../config/env";
import { ScenarioContext } from "../utils/scenarioContext";
import { commonfunction } from "../Actions/commonfunction";
import { expect } from "@playwright/test";
// import { BrowserManager } from '../../playwright-utils/browserManager';

When("I click on {string}", async function (locatorName: string) {
  Logger.info(`Clicking on element: ${locatorName}`);
  const locator = LocatorUtil.getLocator(locatorName);

  let element;

  switch (locator.type.toLowerCase()) {
    case "xpath":
      element = this.page.locator(locator.value);
      break;
    case "css":
      element = this.page.locator(locator.value);
      break;

    case "text":
      element = this.page.getByText(locator.value);
      break;

    case "role":
      element = this.page.getByRole(locator.value as any);

      break;

    default:
      Logger.error(`Unsupported locator type: ${locator.type}`);
      throw new Error(
        `Unsupported locator:
        ${locator.type}`,
      );
  }

  try {
    await element.click();
    Logger.success(`Successfully clicked on: ${locatorName}`);
  } catch (error) {
    Logger.error(`Failed to click on ${locatorName}`, error);
    throw error;
  }
});

When(
  "User enter {string} in {string}",
  async function (inputtext: string, locatorName: string) {
    Logger.info(`Attempting to enter text in field: ${locatorName}`);
    const locator = LocatorUtil.getLocator(locatorName);

    let element;
    let valueToEnter = inputtext;
    let finalValue: any;

    // Check if inputtext is a variable reference (starts with $)
    if (inputtext.startsWith("$")) {
      // Remove $ prefix and get from context
      const contextKey = inputtext.substring(1);
      const contextValue = ScenarioContext.get(contextKey);

      if (contextValue === undefined || contextValue === null) {
        Logger.error("Context value not found", {
          contextKey,
          availableContext: ScenarioContext.getAll(),
        });
        throw new Error(
          `Context variable '${contextKey}' (from $${contextKey}) not found or is null/undefined`,
        );
      }

      finalValue = contextValue;
      Logger.debug("Retrieved dynamic value from context", {
        contextKey,
        value: finalValue,
      });
    }

    switch (locator.type.toLowerCase()) {
      case "xpath":
        element = this.page.locator(locator.value);
        break;
      case "css":
        element = this.page.locator(locator.value);
        break;

      case "text":
        element = this.page.getByText(locator.value);
        break;

      case "role":
        element = this.page.getByRole(locator.value as any);
        break;

      default:
        Logger.error(`Unsupported locator type: ${locator.type}`);
        throw new Error(
          `Unsupported locator:
        ${locator.type}`,
        );
    }

    if (inputtext.startsWith("$")) {
      try {
        Logger.info(`Entering text: ${finalValue} in locator: ${locatorName}`);
        await element.fill(finalValue);
        Logger.success(`Successfully entered text in: ${locatorName}`);
      } catch (error) {
        Logger.error(`Failed to enter text in ${locatorName}`, error);
        throw error;
      }
    } else {
      try {
        Logger.info(`Entering text: ${inputtext} in locator: ${locatorName}`);
        await element.fill(inputtext);
        Logger.success(`Successfully entered text in: ${locatorName}`);
      } catch (error) {
        Logger.error(`Failed to enter text in ${locatorName}`, error);
        throw error;
      }
    }
  },
);

Given("User navigates to {string}", async function (environmentKey: string) {
  Logger.info(
    `Attempting to navigate using environment key: ${environmentKey}`,
  );

  // Get URL from .env file
  const envUrl = process.env[environmentKey];

  // Validate URL exists
  if (!envUrl) {
    Logger.error(`Environment variable "${environmentKey}" is not configured`);
    throw new Error(`URL for "${environmentKey}" is missing in .env file`);
  }

  try {
    const basePage = new BasePage(this.page);
    Logger.info(`Navigating to URL from .env -> ${environmentKey}: ${envUrl}`);
    await basePage.navigateTo(envUrl);
    Logger.success(`Successfully navigated to: ${envUrl}`);
  } catch (error) {
    Logger.error(`Failed to navigate to environment: ${environmentKey}`, error);

    throw error;
  }
});

When(
  "user selects index {string} from dropdown {string}",
  async function (index: string, locatorName: string) {
    Logger.info(
      `Attempting to select index ${index} from dropdown: ${locatorName}`,
    );

    let element;
    const locator = LocatorUtil.getLocator(locatorName);

    switch (locator.type.toLowerCase()) {
      case "xpath":
        element = this.page.locator(locator.value);
        break;
      case "css":
        element = this.page.locator(locator.value);
        break;

      case "text":
        element = this.page.getByText(locator.value);
        break;

      case "role":
        element = this.page.getByRole(locator.value as any);
        break;

      default:
        Logger.error(`Unsupported locator type: ${locator.type}`);
        throw new Error(
          `Unsupported locator:
        ${locator.type}`,
        );
    }

    try {
      const C1 = new commonfunction(this.page);
      await C1.selectDropdown(element, index, "index");
      Logger.success(
        `Successfully selected index ${index} from dropdown: ${locatorName}`,
      );
    } catch (error) {
      Logger.error(
        `Failed to select index ${index} from dropdown ${locatorName}`,
        error,
      );
      throw error;
    }
  },
);

/**
 * GENERIC VALIDATION STEPS
 */

/**
 * Validate text content of any element/locator
 * Supports dynamic values with $ prefix from ScenarioContext
 * @example Then element "submitButton" should have text "Submit"
 * @example Then element "welcomeMessage" should have text "$expectedMessage"
 */
Then(
  "element {string} should have text {string}",
  async function (locatorName: string, expectedText: string) {
    Logger.info(`Validating text on element: ${locatorName}`);
    const locator = LocatorUtil.getLocator(locatorName);

    let finalExpectedText = expectedText;

    // Check if expectedText is a variable reference (starts with $)
    if (expectedText.startsWith("$")) {
      const contextKey = expectedText.substring(1);
      const contextValue = ScenarioContext.get(contextKey);

      if (contextValue === undefined || contextValue === null) {
        Logger.error("Context value not found for text validation", {
          contextKey,
          availableContext: ScenarioContext.getAll(),
        });
        throw new Error(
          `Context variable '${contextKey}' (from $${expectedText}) not found or is null/undefined`,
        );
      }

      finalExpectedText = contextValue;
      Logger.debug("Retrieved dynamic value from context for validation", {
        contextKey,
        value: finalExpectedText,
      });
    }

    let element;

    switch (locator.type.toLowerCase()) {
      case "xpath":
        element = this.page.locator(locator.value);
        break;
      case "css":
        element = this.page.locator(locator.value);
        break;
      case "text":
        element = this.page.getByText(locator.value);
        break;
      case "role":
        element = this.page.getByRole(locator.value as any);
        break;
      default:
        Logger.error(
          `Unsupported locator type for validation: ${locator.type}`,
        );
        throw new Error(`Unsupported locator: ${locator.type}`);
    }

    try {
      const actualText = await element.textContent();
      Logger.debug("Actual element text retrieved", {
        locatorName,
        actualText,
        expectedText: finalExpectedText,
      });

      expect(actualText).toContain(finalExpectedText);
      Logger.success(`Text validation passed for element: ${locatorName}`);
    } catch (error) {
      Logger.error(`Text validation failed for element: ${locatorName}`, {
        expectedText: finalExpectedText,
        error: (error as Error).message,
      });
      throw error;
    }
  },
);

/**
 * Validate page title
 * Supports exact match and partial match
 * @example Then page title should be "Home - MyApp"
 * @example Then page title should contain "MyApp"
 */
Then("page title should be {string}", async function (expectedTitle: string) {
  Logger.info(`Validating page title: ${expectedTitle}`);

  try {
    const actualTitle = await this.page.title();
    Logger.debug("Page title retrieved", {
      actualTitle,
      expectedTitle,
    });

    expect(actualTitle).toBe(expectedTitle);
    Logger.success(`Page title validation passed: "${actualTitle}"`);
  } catch (error) {
    Logger.error(`Page title validation failed`, {
      expectedTitle,
      error: (error as Error).message,
    });
    throw error;
  }
});

/**
 * Validate page title contains specific text (partial match)
 * @example Then page title should contain "MyApp"
 */
Then(
  "page title should contain {string}",
  async function (expectedTextInTitle: string) {
    Logger.info(`Validating page title contains: ${expectedTextInTitle}`);

    try {
      const actualTitle = await this.page.title();
      Logger.debug("Page title retrieved", {
        actualTitle,
        expectedTextInTitle,
      });

      expect(actualTitle).toContain(expectedTextInTitle);
      Logger.success(
        `Page title contains validation passed: "${actualTitle}" contains "${expectedTextInTitle}"`,
      );
    } catch (error) {
      Logger.error(`Page title contains validation failed`, {
        expectedTextInTitle,
        error: (error as Error).message,
      });
      throw error;
    }
  },
);

/**
 * Validate current page URL
 * @example Then current URL should be "https://example.com/home"
 * @example Then current URL should be "https://www.example.com/"
 */
Then("current URL should be {string}", async function (expectedUrl: string) {
  Logger.info(`Validating current URL: ${expectedUrl}`);

  try {
    const actualUrl = this.page.url();
    Logger.debug("Current URL retrieved", {
      actualUrl,
      expectedUrl,
    });

    expect(actualUrl).toBe(expectedUrl);
    Logger.success(`URL validation passed: "${actualUrl}"`);
  } catch (error) {
    Logger.error(`URL validation failed`, {
      expectedUrl,
      error: (error as Error).message,
    });
    throw error;
  }
});

/**
 * Validate current page URL contains specific text (partial match)
 * @example Then current URL should contain "/products"
 * @example Then current URL should contain "example.com"
 */
Then(
  "current URL should contain {string}",
  async function (expectedUrlPart: string) {
    Logger.info(`Validating current URL contains: ${expectedUrlPart}`);

    try {
      const actualUrl = this.page.url();
      Logger.debug("Current URL retrieved", {
        actualUrl,
        expectedUrlPart,
      });

      expect(actualUrl).toContain(expectedUrlPart);
      Logger.success(
        `URL contains validation passed: "${actualUrl}" contains "${expectedUrlPart}"`,
      );
    } catch (error) {
      Logger.error(`URL contains validation failed`, {
        expectedUrlPart,
        error: (error as Error).message,
      });
      throw error;
    }
  },
);
