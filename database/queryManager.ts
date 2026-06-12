import fs from "fs";
import path from "path";

export class QueryManager {
  static getQuery(dbType: string, queryName: string) {
    const filePath = path.resolve(`database/queries/${dbType}Queries.json`);
    const queries = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return queries[queryName];
  }
}
