import { ApiClient } from "../client/apiclient";
import { Logger } from "../../utils/Logger";

export class ApiService {
  private apiClient = new ApiClient();

  async executeRequest(requestData: any) {
    Logger.info("ApiService: Executing request", { endpoint: requestData.endpoint, method: requestData.method });
    try {
      const response = await this.apiClient.sendRequest(requestData.endpoint, {
        method: requestData.method,
        headers: requestData.headers,
        data: requestData.payload,
      });
      Logger.success("ApiService: Request executed successfully");
      return response;
    } catch (error) {
      Logger.error("ApiService: Request execution failed", { error: (error as Error).message });
      throw error;
    }
  }
}
