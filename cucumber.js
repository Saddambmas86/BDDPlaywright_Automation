// Cucumber configuration with Playwright and TypeScript support
// This file defines how Cucumber will execute feature files and step definitions

module.exports = {
  default: {
    // Require step definitions and hooks (compiled TypeScript)
    requireModule: ['ts-node/register'],
    require: [
      'stepDefinitions/**/*.ts',
      'hooks/**/*.ts'
    ],
    
    // Feature files location
    features: ['features/**/*.feature'],
    
    // Format/Reporter configurations
    format: [
      'progress-bar',
      'html:./reports/cucumber-report.html',
      'json:./allure-results/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },

    publishQuiet: true,
    
    // Parallel execution configuration
    parallel: 1,
    
    // Strict mode - fail if there are pending or undefined steps
    strict: true,
    
    // Retry failed scenarios
    retry: 0,
    // retryTagFilter: '@flaky'
    
    // Step timeout in milliseconds (default is 5000, increasing to 30000)
    timeout: 30000,
  },

  // Smoke test configuration
  smoke: {
    requireModule: ['ts-node/register'],
    require: [
      'stepDefinitions/**/*.ts',
      'hooks/**/*.ts'
    ],
    paths: ['features/**/*.feature'],
    tags: '@smoke',
    format: [
      'progress-bar',
      'html:./reports/smoke-report.html',
      'json:./allure-results/cucumber-report.json'
    ],
    parallel: 4,
    timeout: 30000
  },

  // Regression test configuration
  regression: {
    requireModule: ['ts-node/register'],
    require: [
      'stepDefinitions/**/*.ts',
      'hooks/**/*.ts'
    ],
    features: ['features/**/*.feature'],
    tags: '@regression',
    format: [
      'progress-bar',
      'html:./reports/regression-report.html',
      'json:./allure-results/cucumber-report.json'
    ],
    parallel: 4,
    retry: 1,
    timeout: 30000
  }
};
