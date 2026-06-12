const sql = require('mssql');
const mysql = require('mysql2/promise');
const { Logger } = require('../utils/logger');

export class DbClient {
  async executeQuery(dbType: string, query: string) {
    switch (dbType) {
      case "sqlserver":
        Logger.info('Executing SQL Server query', { query: query.substring(0, 50) });
        const pool = await sql.connect({
          server: process.env.SQLSERVER_HOST!,
          user: process.env.SQLSERVER_USER!,
          password: process.env.SQLSERVER_PASSWORD!,
          database: process.env.SQLSERVER_DATABASE!,
          port: Number(process.env.SQLSERVER_PORT)
        });

        const result = await pool.request().query(query);
        Logger.success('SQL Server query executed successfully');
        return result.recordset;

      case "mysql":
        Logger.info('Executing MySQL query', { query: query.substring(0, 50) });
        const connection = await mysql.createConnection({
          host: process.env.MYSQL_HOST!,
          user: process.env.MYSQL_USER!,
          password: process.env.MYSQL_PASSWORD!,
          database: process.env.MYSQL_DATABASE!,
          port: Number(process.env.MYSQL_PORT || 3306)
        });

        const [rows] = await connection.execute(query);
        console.log(`MySQL query result: ${JSON.stringify(rows)}`);
        await connection.end();
        Logger.success('MySQL query executed successfully');
        return rows;

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}
