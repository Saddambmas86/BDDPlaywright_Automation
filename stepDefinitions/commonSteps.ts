import { When, Given } from "@cucumber/cucumber";
import { LocatorUtil } from "../utils/LocatorUtil";
import { Logger } from "../utils/Logger";
import { BasePage } from "../pages/BasePage";
import { env } from "../config/env";
import { ScenarioContext } from "../utils/scenarioContext";
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
          `Context variable '${contextKey}' (from $${contextKey}) not found or is null/undefined`
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

    if (inputtext.startsWith("$")){
    try {
      Logger.info(`Entering text: ${finalValue} in locator: ${locatorName}`);
      await element.fill(finalValue);
      Logger.success(`Successfully entered text in: ${locatorName}`);
    } catch (error) {
      Logger.error(`Failed to enter text in ${locatorName}`, error);
      throw error;
    }
    }

    else{
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

Given("User is on the application", async function () {
  Logger.info(
    `Launching application from environment: ${process.env.NODE_ENV || "dev"}`,
  );

  if (!env.baseURL) {
    Logger.error("Base URL is not configured in environment variables");
    throw new Error("BASE_URL is not set in environment variables");
  }

  try {
    const basePage = new BasePage(this.page);
    Logger.info(`Navigating to base URL: ${env.baseURL}`);
    await basePage.navigateTo(env.baseURL);
    Logger.success(`Successfully launched application at: ${env.baseURL}`);
  } catch (error) {
    Logger.error("Failed to launch application", error);
    throw error;
  }
});

Given(
  "User navigates to {string} from environment",
  async function (environmentKey: string) {
    Logger.info(
      `Attempting to navigate using environment key: ${environmentKey}`,
    );

    // Get URL from .env file
    const envUrl = process.env[environmentKey];

    // Validate URL exists
    if (!envUrl) {
      Logger.error(
        `Environment variable "${environmentKey}" is not configured`,
      );
      throw new Error(`URL for "${environmentKey}" is missing in .env file`);
    }

    try {
      const basePage = new BasePage(this.page);
      Logger.info(
        `Navigating to URL from .env -> ${environmentKey}: ${envUrl}`,
      );
      await basePage.navigateTo(envUrl);
      Logger.success(`Successfully navigated to: ${envUrl}`);
    } catch (error) {
      Logger.error(
        `Failed to navigate to environment: ${environmentKey}`,
        error,
      );

      throw error;
    }
  },
);
