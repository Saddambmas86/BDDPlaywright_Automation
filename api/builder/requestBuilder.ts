import { Logger } from "../../utils/Logger";
import _ from "lodash";

export class RequestBuilder {
  private requestData: any = {
    method: "",
    endpoint: "",
    headers: {},
    payload: {},
    params: {},
  };

  setMethod(method: string): RequestBuilder {
    Logger.debug("RequestBuilder: Setting method", { method });
    this.requestData.method = method;
    return this;
  }

  setEndpoint(endpoint: string): RequestBuilder {
    Logger.debug("RequestBuilder: Setting endpoint", { endpoint });
    this.requestData.endpoint = endpoint;
    return this;
  }

  setHeaders(key: string, value: string): RequestBuilder {
    Logger.debug("RequestBuilder: Setting header", { key, value });
    this.requestData.headers[key] = value;
    return this;
  }

  setPayload(payload: any): RequestBuilder {
    Logger.debug("RequestBuilder: Setting payload", { payloadKeys: Object.keys(payload) });
    this.requestData.payload = payload;
    return this;
  }

  updatePayloadField(fieldPath: string, value: any): RequestBuilder {
    Logger.debug("RequestBuilder: Updating payload field", { fieldPath, value });
    // Use lodash set to handle nested paths like "booking.id"
    _.set(this.requestData.payload, fieldPath, value);
    return this;
  }

  build() {
    Logger.debug("RequestBuilder: Building request", { requestData: this.requestData });
    return this.requestData;
  }
}
