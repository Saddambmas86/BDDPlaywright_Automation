import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * ConfigReader Utility
 * 
 * This utility class manages environment configuration using dotenv.
 * It supports multiple environments (qa, stage, prod, dev).
 * 
 * Usage:
 *   const baseUrl = ConfigReader.getConfig('BASE_URL');
 *   const browser = ConfigReader.getConfig('BROWSER');
 */
class ConfigReader {
  constructor() {
    this.loadEnvironmentConfig();
  }

  /**
   * Load environment configuration based on NODE_ENV
   * Priority: specific env file > .env file > defaults
   */
  private loadEnvironmentConfig(): void {
    const env = process.env.NODE_ENV || 'dev';
    const envFilePath = path.join(__dirname, `../.env.${env}`);

    // Load environment-specific config
    dotenv.config({ path: envFilePath });

    // Load default .env as fallback
    dotenv.config({ path: path.join(__dirname, '../.env') });

    console.log(`✓ Configuration loaded for environment: ${env}`);
  }

  /**
   * Get a configuration value
   * @param key - Configuration key (e.g., 'BASE_URL', 'BROWSER')
   * @param defaultValue - Default value if key not found
   * @returns Configuration value or default value
   */
  static getConfig(key: string, defaultValue?: string): string {
    const value = process.env[key];

    if (!value && !defaultValue) {
      console.warn(`⚠ Configuration key not found: ${key}`);
      return '';
    }

    return value || defaultValue || '';
  }

  /**
   * Get Base URL for the current environment
   */
  static getBaseUrl(): string {
    return this.getConfig('BASE_URL', 'https://saucedemo.com');
  }

  /**
   * Get browser name
   */
  static getBrowser(): string {
    return this.getConfig('BROWSER', 'chromium');
  }

  /**
   * Check if running in headless mode
   */
  static isHeadless(): boolean {
    const headless = this.getConfig('HEADLESS', 'true');
    return headless.toLowerCase() === 'true';
  }

  /**
   * Get timeout value in milliseconds
   */
  static getTimeout(): number {
    const timeout = this.getConfig('TIMEOUT', '30000');
    return parseInt(timeout, 10);
  }

  /**
   * Get slow motion value (for debugging)
   */
  static getSlowMo(): number {
    const slowMo = this.getConfig('SLOW_MO', '0');
    return parseInt(slowMo, 10);
  }

  /**
   * Get current environment
   */
  static getEnvironment(): string {
    return this.getConfig('NODE_ENV', 'dev');
  }

  /**
   * Print all current configurations
   */
  static printConfig(): void {
    console.log('\n=== Current Configuration ===');
    console.log(`Environment: ${this.getEnvironment()}`);
    console.log(`Base URL: ${this.getBaseUrl()}`);
    console.log(`Browser: ${this.getBrowser()}`);
    console.log(`Headless: ${this.isHeadless()}`);
    console.log(`Timeout: ${this.getTimeout()}ms`);
    console.log(`Slow Motion: ${this.getSlowMo()}ms`);
    console.log('=============================\n');
  }
}

// Initialize configuration on import
new ConfigReader();

export default ConfigReader;
