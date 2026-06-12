import { Page, Locator } from '@playwright/test';
import ConfigReader from './ConfigReader';

/**
 * ActionHelper Utility
 * 
 * This class provides reusable generic methods for common UI actions.
 * All methods are designed to work with Playwright's Locator and Page objects.
 * These methods include error handling, logging, and waits.
 * 
 * Usage:
 *   const action = new ActionHelper(page);
 *   await action.click('xpath=//button[@id="login"]');
 *   await action.fill('id=username', 'testuser');
 *   const text = await action.getText('id=message');
 */
class ActionHelper {
  private page: Page;
  private timeout: number;

  /**
   * Constructor
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.timeout = ConfigReader.getTimeout();
  }

  /**
   * Convert locator string to Playwright Locator object
   * Supports xpath, id, css, and other Playwright selectors
   * @param locatorString - Locator string (e.g., 'xpath=//button', 'id=login', 'css=.btn')
   * @returns Playwright Locator object
   * @private
   */
  private getLocator(locatorString: string): Locator {
    const [type, selector] = locatorString.split('=');

    switch (type.toLowerCase()) {
      case 'xpath':
        return this.page.locator(`xpath=${selector}`);
      case 'id':
        return this.page.locator(`#${selector}`);
      case 'css':
        return this.page.locator(selector);
      case 'text':
        return this.page.locator(`text=${selector}`);
      case 'role':
        const [role, name] = selector.split(',');
        return this.page.getByRole(role as any, { name: name?.trim() });
      default:
        return this.page.locator(locatorString);
    }
  }

  /**
   * Click on an element
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   * @example await action.click('id=submitButton');
   */
  async click(locator: string | Locator, timeout?: number): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.click({ timeout: timeout || this.timeout });
      console.log(`✓ Clicked on element: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to click on element: ${locator}`);
      throw error;
    }
  }

  /**
   * Fill text input field
   * @param locator - Locator string or Locator object
   * @param value - Text to fill
   * @param timeout - Optional custom timeout
   * @example await action.fill('id=username', 'testuser');
   */
  async fill(locator: string | Locator, value: string, timeout?: number): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.fill(value, { timeout: timeout || this.timeout });
      console.log(`✓ Filled value in element: ${locator} with "${value}"`);
    } catch (error) {
      console.error(`✗ Failed to fill element: ${locator}`);
      throw error;
    }
  }

  /**
   * Type text character by character (slower, triggers key events)
   * @param locator - Locator string or Locator object
   * @param value - Text to type
   * @param delay - Delay between keystrokes in milliseconds
   * @example await action.type('id=username', 'testuser', 50);
   */
  async type(
    locator: string | Locator,
    value: string,
    delay?: number
  ): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.type(value, { delay: delay || 0 });
      console.log(`✓ Typed value in element: ${locator} with "${value}"`);
    } catch (error) {
      console.error(`✗ Failed to type in element: ${locator}`);
      throw error;
    }
  }

  /**
   * Get text content of an element
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   * @returns Text content
   * @example const buttonText = await action.getText('id=submitButton');
   */
  async getText(locator: string | Locator, timeout?: number): Promise<string> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      const text = await element.textContent({ timeout: timeout || this.timeout });
      console.log(`✓ Retrieved text from element: ${locator} = "${text}"`);
      return text || '';
    } catch (error) {
      console.error(`✗ Failed to get text from element: ${locator}`);
      throw error;
    }
  }

  /**
   * Check if element is visible
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   * @returns Boolean indicating visibility
   * @example const isVisible = await action.isVisible('id=loginButton');
   */
  async isVisible(locator: string | Locator, timeout?: number): Promise<boolean> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      const visible = await element.isVisible({ timeout: timeout || this.timeout });
      console.log(`✓ Element visibility check: ${locator} = ${visible}`);
      return visible;
    } catch (error) {
      console.warn(`⚠ Element not visible or not found: ${locator}`);
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   * @returns Boolean indicating if element is enabled
   */
  async isEnabled(locator: string | Locator, timeout?: number): Promise<boolean> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      const enabled = await element.isEnabled({ timeout: timeout || this.timeout });
      console.log(`✓ Element enabled check: ${locator} = ${enabled}`);
      return enabled;
    } catch (error) {
      console.warn(`⚠ Failed to check if element is enabled: ${locator}`);
      return false;
    }
  }

  /**
   * Wait for element to be visible
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   * @example await action.waitForElement('xpath=//div[@class="loader"]');
   */
  async waitForElement(locator: string | Locator, timeout?: number): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.waitFor({ state: 'visible', timeout: timeout || this.timeout });
      console.log(`✓ Element visible: ${locator}`);
    } catch (error) {
      console.error(`✗ Element not visible after timeout: ${locator}`);
      throw error;
    }
  }

  /**
   * Wait for element to be hidden/detached
   * @param locator - Locator string or Locator object
   * @param timeout - Optional custom timeout
   */
  async waitForElementHidden(
    locator: string | Locator,
    timeout?: number
  ): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.waitFor({ state: 'hidden', timeout: timeout || this.timeout });
      console.log(`✓ Element hidden: ${locator}`);
    } catch (error) {
      console.error(`✗ Element still visible after timeout: ${locator}`);
      throw error;
    }
  }

  /**
   * Select option from dropdown
   * @param locator - Locator string or Locator object
   * @param value - Value or label to select
   * @example await action.selectDropdown('id=countryDropdown', 'USA');
   */
  async selectDropdown(
    locator: string | Locator,
    value: string
  ): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.selectOption(value);
      console.log(`✓ Selected value "${value}" from dropdown: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to select option from dropdown: ${locator}`);
      throw error;
    }
  }

  /**
   * Get attribute value of an element
   * @param locator - Locator string or Locator object
   * @param attributeName - Name of the attribute
   * @returns Attribute value
   * @example const href = await action.getAttribute('id=link', 'href');
   */
  async getAttribute(
    locator: string | Locator,
    attributeName: string
  ): Promise<string | null> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      const value = await element.getAttribute(attributeName);
      console.log(
        `✓ Retrieved attribute "${attributeName}" from element: ${locator} = "${value}"`
      );
      return value;
    } catch (error) {
      console.error(`✗ Failed to get attribute from element: ${locator}`);
      throw error;
    }
  }

  /**
   * Double click on an element
   * @param locator - Locator string or Locator object
   */
  async doubleClick(locator: string | Locator): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.dblclick();
      console.log(`✓ Double clicked on element: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to double click on element: ${locator}`);
      throw error;
    }
  }

  /**
   * Right click (context menu) on an element
   * @param locator - Locator string or Locator object
   */
  async rightClick(locator: string | Locator): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.click({ button: 'right' });
      console.log(`✓ Right clicked on element: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to right click on element: ${locator}`);
      throw error;
    }
  }

  /**
   * Hover over an element
   * @param locator - Locator string or Locator object
   */
  async hover(locator: string | Locator): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.hover();
      console.log(`✓ Hovered over element: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to hover over element: ${locator}`);
      throw error;
    }
  }

  /**
   * Scroll element into view
   * @param locator - Locator string or Locator object
   */
  async scrollIntoView(locator: string | Locator): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.scrollIntoViewIfNeeded();
      console.log(`✓ Scrolled element into view: ${locator}`);
    } catch (error) {
      console.error(`✗ Failed to scroll element into view: ${locator}`);
      throw error;
    }
  }

  /**
   * Take screenshot of specific element
   * @param locator - Locator string or Locator object
   * @param filename - Filename for the screenshot
   */
  async takeElementScreenshot(
    locator: string | Locator,
    filename: string
  ): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.screenshot({ path: filename });
      console.log(`✓ Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to take screenshot: ${filename}`);
      throw error;
    }
  }

  /**
   * Take page screenshot
   * @param filename - Filename for the screenshot
   */
  async takePageScreenshot(filename: string): Promise<void> {
    try {
      await this.page.screenshot({ path: filename });
      console.log(`✓ Page screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to take page screenshot: ${filename}`);
      throw error;
    }
  }

  /**
   * Navigate to URL
   * @param url - URL to navigate to
   */
  async navigate(url: string): Promise<void> {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      console.log(`✓ Navigated to URL: ${url}`);
    } catch (error) {
      console.error(`✗ Failed to navigate to URL: ${url}`);
      throw error;
    }
  }

  /**
   * Get page URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Refresh page
   */
  async refreshPage(): Promise<void> {
    await this.page.reload();
    console.log(`✓ Page refreshed`);
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Clear field and fill new value
   * @param locator - Locator string or Locator object
   * @param value - Value to fill
   */
  async clearAndFill(locator: string | Locator, value: string): Promise<void> {
    try {
      const element =
        typeof locator === 'string' ? this.getLocator(locator) : locator;
      await element.clear();
      await element.fill(value);
      console.log(`✓ Cleared and filled element: ${locator} with "${value}"`);
    } catch (error) {
      console.error(`✗ Failed to clear and fill element: ${locator}`);
      throw error;
    }
  }
}

export default ActionHelper;
