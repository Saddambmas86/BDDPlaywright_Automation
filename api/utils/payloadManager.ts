import path from 'path';
import fs from "fs";

export class PayloadManager {
  static getPayload(fileName: string) {
    const filePath = path.resolve(`api/payloads/${fileName}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`${fileName}.json not found`);
    }

    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
}
