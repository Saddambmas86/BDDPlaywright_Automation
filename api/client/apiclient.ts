import { request } from "@playwright/test";
import { env } from "../../config/env";
import { Logger } from "../../utils/Logger";

export class ApiClient {
  async sendRequest(endpoint: string, options: any) {
    Logger.debug("ApiClient: Creating API context", { baseURL: env.baseURL });
    try {
      const apiContext = await request.newContext({ 
        baseURL: env.baseURL!,
        ignoreHTTPSErrors: true 
      });
      Logger.debug("ApiClient: API context created successfully");

      Logger.debug("ApiClient: Sending request", { endpoint, method: options.method });
      const response = await apiContext.fetch(endpoint, options);

      Logger.success("ApiClient: Response received", { statusCode: response.status() });

      return response;
    } catch (error) {
      Logger.error("ApiClient: Request failed", { error: (error as Error).message });
      throw error;
    }
  }
}
