import { BasePage } from "../pages/BasePage";
import { Locator } from "@playwright/test";
import { Logger } from "../utils/Logger";


export class commonfunction extends BasePage {

//Function to select an option from a dropdown based on the type provided
public async selectDropdown(locator: string | Locator,option: string,type: "text" | "value" | "index" = "text"): Promise<void>{
  try {
    Logger.info(`Attempting to select dropdown with type: ${type}`, { option });

    // Handle both string selectors and Locator objects
    const dropdown: Locator = typeof locator === 'string' ? this.page.locator(locator) : locator;
    Logger.debug(`Dropdown locator initialized`, { type: typeof locator });

    // Native select dropdown
    const tagName = await dropdown.evaluate((el: any) => el.tagName.toLowerCase());
    Logger.debug(`Element tag name detected: ${tagName}`);

    if (tagName === "select") {
      Logger.info(`Native select dropdown detected`);
      switch (type) {
        case "text":
          Logger.debug(`Selecting by label: ${option}`);
          await dropdown.selectOption({ label: option });
          Logger.success(`Successfully selected option by text: ${option}`);
          break;

        case "value":
          Logger.debug(`Selecting by value: ${option}`);
          await dropdown.selectOption({ value: option });
          Logger.success(`Successfully selected option by value: ${option}`);
          break;

        case "index":
          Logger.debug(`Selecting by index: ${option}`);
          await dropdown.selectOption({
            index: Number(option)
          });
          Logger.success(`Successfully selected option by index: ${option}`);
          break;
      }
    } else {
      // Custom dropdown handling
      Logger.info(`Custom dropdown detected, clicking dropdown element`);
      await dropdown.click();
      Logger.debug(`Dropdown clicked, waiting for option visibility`);

      const optionLocator = this.page.locator(
        `//*[contains(text(),"${option}")]`
      );

      await optionLocator.waitFor({
        state: "visible"
      });
      Logger.debug(`Option element is now visible`);

      await optionLocator.click();
      Logger.success(`Successfully selected custom dropdown option: ${option}`);
    }
  } catch (error) {
    Logger.error(`Failed to select dropdown option: ${option}`, error);
    throw error;
  }
}


//Function to wait for a specific condition based on the type provided
public async dynamicWait(
  type: string,
  value?: string
): Promise<void> {

  switch (type.toLowerCase()) {

    case "seconds":
      await this.page.waitForTimeout(
        Number(value) * 1000
      );
      break;

    case "milliseconds":
      await this.page.waitForTimeout(
        Number(value)
      );
      break;

    case "load":
      await this.page.waitForLoadState(
        "load"
      );
      break;

    case "networkidle":
      await this.page.waitForLoadState(
        "networkidle"
      );
      break;

    case "domcontentloaded":
      await this.page.waitForLoadState(
        "domcontentloaded"
      );
      break;

    case "url":
      await this.page.waitForURL(
        value!
      );
      break;

    default:
      throw new Error(
        `Unsupported wait type: ${type}`
      );
  }
}

}




