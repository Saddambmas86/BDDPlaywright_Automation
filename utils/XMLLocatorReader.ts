import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

/**
 * XMLLocatorReader Utility
 * 
 * This utility class is responsible for reading XML locator files and extracting
 * locators dynamically. It caches parsed XML data to optimize performance.
 * 
 * Usage:
 *   const locator = XMLLocatorReader.getLocator('LoginPage', 'username');
 *   // Returns: xpath=//input[@id='user-name']
 */
class XMLLocatorReader {
  // Cache to store parsed XML data to avoid repeated file reads
  private static locatorCache: Map<string, any> = new Map();

  /**
   * Get a locator from XML files
   * @param pageName - Name of the page (e.g., 'LoginPage')
   * @param locatorName - Name of the locator element (e.g., 'username')
   * @returns The locator string (e.g., 'xpath=//input[@id='user-name']')
   * @throws Error if page or locator not found
   */
  static async getLocator(pageName: string, locatorName: string): Promise<string> {
    try {
      // Check cache first
      if (!this.locatorCache.has(pageName)) {
        // If not in cache, read and parse XML file
        const locatorData = await this.readXMLFile(pageName);
        this.locatorCache.set(pageName, locatorData);
      }

      // Get cached data
      const pageLocators = this.locatorCache.get(pageName);

      // Extract the specific locator
      if (!pageLocators[pageName] || !pageLocators[pageName][locatorName]) {
        throw new Error(
          `Locator '${locatorName}' not found for page '${pageName}'`
        );
      }

      const locator = pageLocators[pageName][locatorName][0];
      console.log(`✓ Fetched locator: ${pageName}.${locatorName} = ${locator}`);
      return locator;
    } catch (error) {
      console.error(
        `✗ Error fetching locator - Page: ${pageName}, Locator: ${locatorName}`
      );
      throw error;
    }
  }

  /**
   * Read and parse XML file
   * @param pageName - Name of the page
   * @returns Parsed XML object
   * @private
   */
  private static async readXMLFile(pageName: string): Promise<any> {
    // Construct file path
    const filePath = path.join(__dirname, `../locators/${pageName}.xml`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Locator file not found: ${filePath}`);
    }

    // Read file content
    const xmlContent = fs.readFileSync(filePath, 'utf-8');

    // Parse XML to JavaScript object
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);

    return result;
  }

  /**
   * Clear the cache (useful for testing or reloading locators)
   */
  static clearCache(): void {
    this.locatorCache.clear();
    console.log('✓ Locator cache cleared');
  }

  /**
   * Get all locators for a specific page
   * @param pageName - Name of the page
   * @returns Object containing all locators for the page
   */
  static async getAllLocators(pageName: string): Promise<any> {
    try {
      if (!this.locatorCache.has(pageName)) {
        const locatorData = await this.readXMLFile(pageName);
        this.locatorCache.set(pageName, locatorData);
      }
      return this.locatorCache.get(pageName);
    } catch (error) {
      console.error(`Error fetching all locators for page: ${pageName}`);
      throw error;
    }
  }
}

export default XMLLocatorReader;
