/**
 * Convert Cucumber JSON report to Allure JSON format
 * Run after Cucumber tests complete
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const cucumberReportPath = './allure-results/cucumber-report.json';
const allureResultsDir = './allure-results';

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0;
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function convertCucumberToAllure() {
  try {
    // Read Cucumber report
    if (!fs.existsSync(cucumberReportPath)) {
      console.log('❌ Cucumber report not found');
      return;
    }

    const cucumberData = JSON.parse(fs.readFileSync(cucumberReportPath, 'utf-8'));
    console.log(`✓ Loaded Cucumber report with ${cucumberData.length} features`);

    // Process each feature
    cucumberData.forEach((feature, featureIndex) => {
      feature.elements?.forEach((scenario, scenarioIndex) => {
        // Create Allure result file for each scenario
        const testUuid = generateUUID();
        const result = {
          uuid: testUuid,
          name: scenario.name,
          fullName: `${feature.name} > ${scenario.name}`,
          status: scenario.steps?.some(s => s.result?.status === 'failed') ? 'failed' : 'passed',
          stage: 'finished',
          description: scenario.description || '',
          descriptionHtml: `<p>${scenario.description || ''}</p>`,
          steps: [],
          attachments: [],
          parameters: [],
          start: Date.now(),
          stop: Date.now() + 5000,
          duration: 5000,
          flaky: false,
          newFailed: false,
          newPassed: false,
          newBroken: false,
          retriesCount: 0,
          retriesStatusChange: false,
          beforeStages: [],
          afterStages: [],
          labels: [
            {
              name: 'feature',
              value: feature.name
            },
            {
              name: 'story',
              value: scenario.name
            },
            {
              name: 'severity',
              value: 'normal'
            }
          ],
          links: [],
          hidden: false,
          deleted: false
        };

        // Add steps
        scenario.steps?.forEach((step, stepIndex) => {
          result.steps.push({
            name: `${step.keyword} ${step.name}`,
            status: step.result?.status || 'passed',
            stage: 'finished',
            start: Date.now() + (stepIndex * 1000),
            stop: Date.now() + (stepIndex * 1000) + 500,
            duration: 500,
            parameters: [],
            type: 'step',
            attachments: []
          });
        });

        // Write Allure result file
        const filename = `${testUuid}-result.json`;
        fs.writeFileSync(path.join(allureResultsDir, filename), JSON.stringify(result, null, 2));
        console.log(`✓ Created: ${filename}`);
      });
    });

    console.log('✅ Conversion completed successfully');
  } catch (error) {
    console.error('❌ Conversion error:', error.message);
  }
}

// Run conversion
convertCucumberToAllure();
