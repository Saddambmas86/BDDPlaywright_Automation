import locators from "../locators/locators.json";

export class LocatorUtil {
  static getLocator(locatorName: string) {
    const locator = locators[locatorName as keyof typeof locators];

    if (!locator) {
      throw new Error(`Locator not found:${locatorName}`);
    }
    return locator;
  }
}
