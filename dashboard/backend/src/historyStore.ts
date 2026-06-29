import * as fs from 'fs';
import * as path from 'path';
import { ConfigSettings, ExecutionHistoryItem } from '../../shared/types';

const DATA_DIR = path.join(__dirname, '../data');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const DEFAULT_SETTINGS_FILE = path.join(__dirname, '../../config/default-settings.json');

/**
 * Ensure storage directories and files exist
 */
function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  // Copy default settings if not exists
  if (!fs.existsSync(SETTINGS_FILE)) {
    if (fs.existsSync(DEFAULT_SETTINGS_FILE)) {
      fs.copyFileSync(DEFAULT_SETTINGS_FILE, SETTINGS_FILE);
    } else {
      const defaultSettings: ConfigSettings = {
        frameworkPath: path.resolve(path.join(__dirname, '../../..')).replace(/\\/g, '/'),
        playwrightPath: 'npx playwright',
        reportPath: './reports',
        defaultBrowser: 'chromium',
        defaultEnvironment: 'qa',
        defaultTimeout: 30000,
        defaultHeadless: true,
        theme: 'dark',
        notifications: {
          desktop: true,
          slackWebhook: '',
          teamsWebhook: '',
          emailRecipient: ''
        }
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    }
  }

  // Create empty history if not exists
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Initialize storage immediately
ensureStorage();

export class HistoryStore {
  /**
   * Get configuration settings
   */
  static getSettings(): ConfigSettings {
    ensureStorage();
    try {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading settings:', error);
      // Fallback
      return {
        frameworkPath: path.resolve(path.join(__dirname, '../../..')).replace(/\\/g, '/'),
        playwrightPath: 'npx playwright',
        reportPath: './reports',
        defaultBrowser: 'chromium',
        defaultEnvironment: 'qa',
        defaultTimeout: 30000,
        defaultHeadless: true,
        theme: 'dark',
        notifications: {
          desktop: true,
          slackWebhook: '',
          teamsWebhook: '',
          emailRecipient: ''
        }
      };
    }
  }

  /**
   * Save configuration settings
   */
  static saveSettings(settings: ConfigSettings): void {
    ensureStorage();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  }

  /**
   * Get all test execution history
   */
  static getHistory(): ExecutionHistoryItem[] {
    ensureStorage();
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  /**
   * Save history array
   */
  static saveHistory(history: ExecutionHistoryItem[]): void {
    ensureStorage();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  }

  /**
   * Add single run history item
   */
  static addHistoryItem(item: ExecutionHistoryItem): void {
    const history = this.getHistory();
    history.unshift(item); // Add to beginning (newest first)
    this.saveHistory(history);
  }

  /**
   * Delete history item
   */
  static deleteHistoryItem(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    this.saveHistory(filtered);

    // Also delete logs file if exists
    const logPath = this.getLogPath(id);
    if (fs.existsSync(logPath)) {
      try {
        fs.unlinkSync(logPath);
      } catch (err) {
        console.error(`Failed to delete log file for run ${id}:`, err);
      }
    }
  }

  /**
   * Get path to the console log file for a run
   */
  static getLogPath(runId: string): string {
    return path.join(LOGS_DIR, `${runId}.log`);
  }

  /**
   * Write execution log
   */
  static writeLog(runId: string, content: string): void {
    ensureStorage();
    fs.writeFileSync(this.getLogPath(runId), content, 'utf-8');
  }

  /**
   * Read execution log
   */
  static readLog(runId: string): string {
    ensureStorage();
    const logPath = this.getLogPath(runId);
    if (fs.existsSync(logPath)) {
      return fs.readFileSync(logPath, 'utf-8');
    }
    return '';
  }
}
