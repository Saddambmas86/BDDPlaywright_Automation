import * as fs from 'fs';
import * as path from 'path';

/**
 * EndpointsReader Utility
 * 
 * This utility loads API endpoints from environment-specific JSON files.
 * Supports multiple environments: dev, qa, uat, ebf
 * 
 * Usage:
 *   const endpoint = EndpointsReader.getEndpoint('auth');
 *   const endpoints = EndpointsReader.getAllEndpoints();
 */
class EndpointsReader {
  private static endpoints: Record<string, string> = {};

  /**
   * Initialize and load endpoints for the current environment
   */
  static initialize(): void {
    const env = process.env.NODE_ENV || 'dev';
    this.loadEndpoints(env);
  }

  /**
   * Load endpoints from environment-specific JSON file
   * @param environment - Environment name (dev, qa, uat, ebf)
   */
  private static loadEndpoints(environment: string): void {
    try {
      const endpointsFile = path.join(__dirname, `../api/config/endpoints.${environment}.json`);
      
      // Check if environment-specific file exists
      if (!fs.existsSync(endpointsFile)) {
        console.warn(`⚠ Endpoints file not found for environment: ${environment}. Using dev endpoints.`);
        const devFile = path.join(__dirname, '../api/config/endpoints.dev.json');
        this.endpoints = JSON.parse(fs.readFileSync(devFile, 'utf-8'));
      } else {
        this.endpoints = JSON.parse(fs.readFileSync(endpointsFile, 'utf-8'));
      }

      console.log(`✓ Endpoints loaded for environment: ${environment}`);
    } catch (error) {
      console.error(`❌ Error loading endpoints: ${(error as Error).message}`);
      this.endpoints = {};
    }
  }

  /**
   * Get a specific endpoint by key
   * @param key - Endpoint key (e.g., 'auth', 'booking_create', 'users_list')
   * @returns Endpoint URL
   */
  static getEndpoint(key: string): string {
    if (!this.endpoints[key]) {
      console.warn(`⚠ Endpoint not found: ${key}`);
      return '';
    }
    return this.endpoints[key];
  }

  /**
   * Get all endpoints
   * @returns All endpoints as key-value pairs
   */
  static getAllEndpoints(): Record<string, string> {
    return { ...this.endpoints };
  }

  /**
   * Get endpoint with dynamic path parameters
   * @param key - Endpoint key
   * @param params - Object with parameters to replace in the URL (e.g., {bookingId: 123})
   * @returns Endpoint URL with parameters replaced
   */
  static getEndpointWithParams(key: string, params: Record<string, string | number>): string {
    let endpoint = this.getEndpoint(key);

    // Replace all {paramName} with actual values
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      endpoint = endpoint.replace(`{${paramKey}}`, String(paramValue));
    });

    return endpoint;
  }

  /**
   * Print all current endpoints
   */
  static printEndpoints(): void {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║         API Endpoints Configuration         ║');
    console.log('╚════════════════════════════════════════════╝\n');

    if (Object.keys(this.endpoints).length === 0) {
      console.log('No endpoints loaded');
      return;
    }

    Object.entries(this.endpoints).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(25)} → ${value}`);
    });

    console.log('');
  }
}

// Initialize endpoints when module is imported
EndpointsReader.initialize();

export default EndpointsReader;
