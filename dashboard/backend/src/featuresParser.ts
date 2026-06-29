import * as fs from 'fs';
import * as path from 'path';
import { FeatureInfo, ScenarioInfo } from '../../shared/types';

/**
 * Recursively find all files with a given extension in a directory
 */
function getFilesRecursively(dir: string, ext: string): string[] {
  let results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  });

  return results;
}

/**
 * Parsers cucumber .feature file to extract Feature, Scenarios, and Tags
 */
export function parseFeatureFile(filePath: string, projectRoot: string): FeatureInfo | null {
  try {
    const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    let featureName = '';
    let featureDescription = '';
    let featureTags: string[] = [];
    let scenarios: ScenarioInfo[] = [];

    let currentTags: string[] = [];
    let isParsingDescription = false;

    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      const line = rawLine.trim();

      // Skip comments
      if (line.startsWith('#')) {
        return;
      }

      // Check for tags (lines starting with @)
      if (line.startsWith('@')) {
        // e.g. "@smoke @regression" -> ["@smoke", "@regression"]
        const tags = line.split(/\s+/).filter(t => t.startsWith('@'));
        currentTags = currentTags.concat(tags);
        return;
      }

      // Check for Feature header
      if (line.startsWith('Feature:')) {
        featureName = line.substring(8).trim();
        featureTags = [...currentTags];
        currentTags = [];
        isParsingDescription = true;
        return;
      }

      // Check for Scenario / Scenario Outline headers
      if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
        isParsingDescription = false;
        const type = line.startsWith('Scenario Outline:') ? 'Scenario Outline' : 'Scenario';
        const name = line.startsWith('Scenario Outline:') 
          ? line.substring(17).trim() 
          : line.substring(9).trim();

        scenarios.push({
          name: name || `Unnamed Scenario (Line ${lineNum})`,
          line: lineNum,
          tags: [...currentTags],
          type,
          featureName,
          featureFile: relativePath
        });

        currentTags = [];
        return;
      }

      // Accumulate description lines after Feature: and before Scenarios
      if (isParsingDescription && line !== '') {
        featureDescription += (featureDescription ? ' ' : '') + line;
      }
    });

    if (!featureName) {
      // Not a valid feature file
      return null;
    }

    return {
      file: relativePath,
      name: featureName,
      description: featureDescription,
      scenarioCount: scenarios.length,
      tags: featureTags,
      scenarios
    };
  } catch (error) {
    console.error(`Error parsing feature file ${filePath}:`, error);
    return null;
  }
}

/**
 * Scan features directory and return list of features
 */
export function scanFeatures(projectRoot: string): FeatureInfo[] {
  const featuresDir = path.join(projectRoot, 'features');
  const files = getFilesRecursively(featuresDir, '.feature');
  const featuresList: FeatureInfo[] = [];

  files.forEach((file) => {
    const feature = parseFeatureFile(file, projectRoot);
    if (feature) {
      featuresList.push(feature);
    }
  });

  return featuresList;
}

/**
 * Get all scenarios from all features
 */
export function scanScenarios(projectRoot: string): ScenarioInfo[] {
  const features = scanFeatures(projectRoot);
  const scenarios: ScenarioInfo[] = [];

  features.forEach((feature) => {
    scenarios.push(...feature.scenarios);
  });

  return scenarios;
}
