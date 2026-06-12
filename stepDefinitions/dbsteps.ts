import { Given } from "@cucumber/cucumber";
import { DbClient } from "../database/dbClient";
import { QueryManager } from "../database/queryManager";
import { ScenarioContext } from "../utils/scenarioContext";
import { Logger } from "../utils/Logger";

Given(
  "user fetches db value from {string} query {string} and stores as {string}",
  async function (dbType: string, queryName: string, variableName: string) {
    Logger.info("Fetching database value", { dbType, queryName, variableName });

    const query = QueryManager.getQuery(dbType, queryName);
    Logger.debug("Query retrieved", { query: query.substring(0, 100) });

    const dbClient = new DbClient();
    const result = await dbClient.executeQuery(dbType, query);

    Logger.debug("Database result received", {
      resultType: typeof result,
      isArray: Array.isArray(result),
      resultLength: result?.length,
      firstRow: result?.[0],
    });

    // Extract value from first row
    const firstRow = result?.[0];
    if (!firstRow) {
      Logger.error("No rows returned from database query");
      throw new Error("Database query returned no results");
    }

    // Case-insensitive column matching
    const columnName = Object.keys(firstRow).find((key) => key.toLowerCase() === variableName.toLowerCase(),);

    if (!columnName) {
      Logger.error("Column not found", {
        variableName,
        availableKeys: Object.keys(firstRow),
      });
      throw new Error(
        `Column '${variableName}' not found in query results. Available columns: ${Object.keys(firstRow).join(", ")}`,
      );
    }

    const value = firstRow[columnName];

    if (value === undefined || value === null) {
      Logger.warn("Value is null or undefined", {
        columnName,
        value,
      });
    }

    Logger.success("Database value fetched successfully", {
      columnName,
      value,
      valueType: typeof value,
    });

    ScenarioContext.set(variableName, value);
  },
);
