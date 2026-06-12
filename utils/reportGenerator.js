const fs = require('fs');
const path = require('path');

/**
 * Generates a timestamped report directory path
 * Format: reports/YYYY-MM-DD_HH-mm-ss
 * Creates the directory if it doesn't exist
 */
class ReportGeneratorCJS {
  static getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  static getReportPath(reportType = 'cucumber') {
    const timestamp = this.getTimestamp();
    const reportDir = path.join('reports', timestamp);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    return path.join(reportDir, `${reportType}-report.html`);
  }

  static getAllureResultsPath() {
    const timestamp = this.getTimestamp();
    const resultsDir = path.join('allure-results', timestamp);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    return path.join(resultsDir, 'cucumber-report.json');
  }

  static getReportDirectory() {
    const timestamp = this.getTimestamp();
    const reportDir = path.join('reports', timestamp);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    return reportDir;
  }
}

module.exports = ReportGeneratorCJS;
