import {
  Given,
  When,
  Then,
  setDefaultTimeout,
  After,
} from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import _ from "lodash";
import { RequestBuilder } from "../api/builder/requestBuilder";
import { PayloadManager } from "../api/utils/payloadManager";
import { EndpointManager } from "../api/utils/endpointManager";
import { ApiService } from "../api/service/apiService";
import { Logger } from "../utils/Logger";
import { ScenarioContext } from "../utils/scenarioContext";

// Set timeout to 30 seconds for API requests
setDefaultTimeout(30 * 1000);

const requestBuilder = new RequestBuilder();
const apiService = new ApiService();
let response: any;
// Clear scenario context after each scenario
After(function () {
  Logger.debug("Clearing scenario context");
  ScenarioContext.clear();
});

/**
 * Parse static values from step parameters into appropriate JS types
 * Supports: boolean (true/false), numbers, null/undefined, strings (with/without quotes)
 * @param value - String value to parse
 * @returns Parsed value with appropriate type
 */
function parseStaticValue(value: string): any {
  // Check for boolean values
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  // Check for null/undefined
  if (value.toLowerCase() === "null") return null;
  if (value.toLowerCase() === "undefined") return undefined;

  // Check for numeric value
  if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      Logger.debug("Parsed as number", { rawValue: value, parsedValue: num });
      return num;
    }
  }

  // Check if string is quoted (e.g., "hello" or 'hello')
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    const unquoted = value.slice(1, -1);
    Logger.debug("Parsed as quoted string", { rawValue: value, parsedValue: unquoted });
    return unquoted;
  }

  // Default: return as string
  Logger.debug("Parsed as unquoted string", { rawValue: value });
  return value;
}

Given("user sets method {string}", function (method: string) {
  Logger.info("Setting HTTP method", { method });
  requestBuilder.setMethod(method);
  Logger.success("HTTP method set successfully", { method });
});

Given("user sets endpoint from config {string}", function (endpointName: string) {
  Logger.info("Setting endpoint from config", { endpointName });
  
  try {
    const endpoint = EndpointManager.getEndpoint(endpointName);
    requestBuilder.setEndpoint(endpoint);
    Logger.success("Endpoint from config set successfully", { 
      endpointName,
      endpoint 
    });
  } catch (error) {
    Logger.error("Failed to set endpoint from config", { 
      endpointName,
      error: (error as Error).message 
    });
    throw error;
  }
});


Given("user sets payload {string}", function (payloadName: string) {
  Logger.info("Setting payload", { payloadName });
  const payload = PayloadManager.getPayload(payloadName);
  requestBuilder.setPayload(payload);
  Logger.success("Payload set successfully", {
    payloadName,
    payloadSize: JSON.stringify(payload).length,
  });
});

When(
  "user replaces {string} in payload with stored value {string}",
  function (payloadFieldPath: string, valueParameter: string) {
    Logger.info("Replacing payload field with value", {
      payloadFieldPath,
      valueParameter,
    });

    let finalValue: any;
    let valueSource = "static";

    // Check if value starts with $ to indicate dynamic/context value
    if (valueParameter.startsWith("$")) {
      // Remove $ prefix and get from context
      const contextKey = valueParameter.substring(1);
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
      valueSource = "dynamic";
      Logger.debug("Retrieved dynamic value from context", {
        contextKey,
        value: finalValue,
      });
    } else {
      // Treat as static value and parse it
      finalValue = parseStaticValue(valueParameter);
      Logger.debug("Using static value", {
        rawValue: valueParameter,
        parsedValue: finalValue,
        valueType: typeof finalValue,
      });
    }

    // Update the payload field
    requestBuilder.updatePayloadField(payloadFieldPath, finalValue);

    Logger.success("Payload field replaced successfully", {
      payloadFieldPath,
      valueSource,
      newValue: finalValue,
      valueType: typeof finalValue,
    });
  }
);

When("user sends api request", async function () {
  Logger.section("SENDING API REQUEST");
  const requestData = requestBuilder.build();
  Logger.info("Request data prepared", { requestData });
  try {
    response = await apiService.executeRequest(requestData);
    Logger.success("API request completed successfully", {
      statusCode: response.status(),
    });
  } catch (error) {
    Logger.error("API request failed", { error: (error as Error).message });
    throw error;
  }
});

Given(
  "user adds header {string} as {string}",
  function (key: string, value: string) {
    Logger.info("Adding request header", { key, rawValue: value });

    let headerValue = value;

    // Check if value is a variable reference (starts with $)
    if (headerValue.startsWith("$")) {
      const contextKey = headerValue.substring(1);
      Logger.debug("Header value is a variable reference", { contextKey });

      headerValue = ScenarioContext.get(contextKey);

      if (!headerValue) {
        Logger.warn("Context variable not found", {
          contextKey,
          availableContext: ScenarioContext.getAll(),
        });
        throw new Error(`Context variable '${contextKey}' not found`);
      }
      Logger.debug("Retrieved value from context", { contextKey, headerValue });
    }

    requestBuilder.setHeaders(key, headerValue);
    Logger.success("Header added successfully", { key, headerValue });
  },
);

Given(
  "user stores response path {string} as {string}",
  async function (path, key) {
    Logger.info("Storing response data", { path, key });
    const body = await response.json();
    Logger.debug("Response body received", { body });

    const value = _.get(body, path);

    if (value === undefined || value === null) {
      Logger.warn("Extracted value is empty or null", {
        path,
        value,
        availableKeys: Object.keys(body),
      });
    } else {
      Logger.debug("Value extracted from response", { path, value });
    }

    ScenarioContext.set(key, value);
    Logger.success("Response data stored successfully", {
      key,
      value,
      type: typeof value,
    });
  },
);

Then("response status should be {int}", function (statusCode: number) {
  Logger.info("Verifying response status code", { expectedStatus: statusCode });

  if (!response) {
    Logger.error("Response object is not available", { response });
    throw new Error(
      "Response is undefined. Make sure API request was executed successfully.",
    );
  }

  const actualStatus = response.status();
  Logger.debug("Response status retrieved", { actualStatus });
  Logger.info("Verifying response status code", {
    expectedStatus: statusCode,
    actualStatus: actualStatus,
  });

  expect(actualStatus).toBe(statusCode);
  Logger.success("Response status code verification passed", {
    statusCode,
    actualStatus,
  });
});

Then("response path {string} should be {string}",async function (jsonPath: string, expectedValue: string) {
    Logger.info("Verifying response body path value", {jsonPath,expectedValue,});
    if (!response) {
      Logger.error("Response object is undefined");
      throw new Error("Response is undefined");
    }
    const responseBody = await response.json();
    const actualValue = _.get(responseBody, jsonPath);
    Logger.debug("Response path value retrieved", {jsonPath,actualValue});
    expect(String(actualValue)).toBe(expectedValue);
  },
);





