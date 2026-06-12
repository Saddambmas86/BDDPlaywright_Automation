import path from 'path';
import fs from "fs";
import { Logger } from "../../utils/Logger";

export class EndpointManager {
  private static endpoints: Record<string, string> | null = null;
  private static currentEnvironment: string = '';

  /**
   * Get the appropriate endpoints file path based on environment
   */
  private static getEndpointsFilePath(): string {
    const environment = process.env.NODE_ENV || 'dev';
    this.currentEnvironment = environment;

    // Using switch statement to determine file path based on environment
    switch (environment.toLowerCase()) {
      case 'qa':
        return path.resolve('api/config/endpoints.qa.json');
      case 'uat':
        return path.resolve('api/config/endpoints.uat.json');
      case 'ebf':
        return path.resolve('api/config/endpoints.ebf.json');
      case 'dev':
        return path.resolve('api/config/endpoints.dev.json');
      default:
        Logger.warn(`Unknown environment: ${environment}. Defaulting to dev endpoints.`, { environment });
        return path.resolve('api/config/endpoints.dev.json');
    }
  }

  private static loadEndpoints(): Record<string, string> {
    if (this.endpoints) {
      return this.endpoints;
    }

    // Get the appropriate file path based on environment
    const filePath = this.getEndpointsFilePath();

    if (!fs.existsSync(filePath)) {
      Logger.error("Endpoints file not found", { path: filePath, environment: this.currentEnvironment });
      throw new Error(`endpoints file not found at ${filePath} for environment: ${this.currentEnvironment}`);
    }

    try {
      this.endpoints = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, string>;
      Logger.success("Endpoints loaded successfully", {
        environment: this.currentEnvironment,
        file: filePath,
        count: Object.keys(this.endpoints || {}).length
      });
      return this.endpoints || {};
    } catch (error) {
      Logger.error("Failed to parse endpoints file", { 
        error: (error as Error).message,
        file: filePath,
        environment: this.currentEnvironment
      });
      throw error;
    }
  }

  /**
   * Get endpoint by name
   */
  static getEndpoint(endpointName: string): string {
    const endpoints = this.loadEndpoints();
    
    if (!endpoints[endpointName]) {
      Logger.error("Endpoint not found", { 
        endpointName,
        environment: this.currentEnvironment,
        availableEndpoints: Object.keys(endpoints)
      });
      throw new Error(`Endpoint '${endpointName}' not found in ${this.currentEnvironment} environment. Available: ${Object.keys(endpoints).join(", ")}`);
    }

    const endpoint = endpoints[endpointName];
    Logger.info("Endpoint retrieved", { endpointName, endpoint, environment: this.currentEnvironment });
    return endpoint;
  }

  /**
   * Get endpoint with dynamic parameters
   */
  static getEndpointWithParams(endpointName: string, params: Record<string, string | number>): string {
    let endpoint = this.getEndpoint(endpointName);

    // Replace all {paramName} with actual values
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, String(value));
    });

    Logger.info("Endpoint with parameters", { endpointName, params, endpoint, environment: this.currentEnvironment });
    return endpoint;
  }

  /**
   * Get current environment
   */
  static getCurrentEnvironment(): string {
    if (!this.currentEnvironment) {
      this.getEndpointsFilePath();
    }
    return this.currentEnvironment;
  }

  /**
   * Get all endpoints
   */
  static getAllEndpoints(): Record<string, string> {
    return this.loadEndpoints();
  }

  /**
   * Print all endpoints
   */
  static printEndpoints(): void {
    const endpoints = this.loadEndpoints();
    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║    API Endpoints - ${this.currentEnvironment.toUpperCase()} Environment       ║`);
    console.log('╚════════════════════════════════════════════╝\n');

    if (Object.keys(endpoints).length === 0) {
      console.log('No endpoints loaded');
      return;
    }

    Object.entries(endpoints).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(25)} → ${value}`);
    });

    console.log('');
  }

  /**
   * Reset endpoints cache (useful for testing)
   */
  static reset(): void {
    this.endpoints = null;
    this.currentEnvironment = '';
  }
}

