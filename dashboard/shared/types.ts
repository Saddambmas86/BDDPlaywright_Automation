export interface TestRunRequest {
  suiteType: 'all' | 'smoke' | 'regression' | 'sanity' | 'critical' | 'feature' | 'scenario' | 'tag' | 'custom';
  targetValue?: string; // name of scenario, tag name, path to feature, or custom command
  browser: 'chromium' | 'firefox' | 'webkit';
  environment: 'dev' | 'qa' | 'sit' | 'uat' | 'prod';
  headless: boolean;
  parallel: boolean;
  workers: number;
  retries: number;
  timeout: number;
  slowMo: number;
  video: 'on' | 'off' | 'retain-on-failure' | 'retry-with-video';
  trace: 'on' | 'off' | 'retain-on-failure' | 'retry-with-trace';
  screenshot: 'on' | 'off' | 'only-on-failure';
}

export interface TestRunStatus {
  status: 'idle' | 'queued' | 'running';
  progress: number; // 0 to 100
  completedScenarios: number;
  totalScenarios: number;
  currentFeature?: string;
  currentScenario?: string;
  currentStep?: string;
  eta?: number; // seconds remaining
  startTime?: number; // timestamp
  elapsed?: number; // seconds elapsed
  runId?: string;
}

export interface ExecutionHistoryItem {
  id: string;
  timestamp: string;
  duration: number; // ms
  environment: string;
  browser: string;
  suiteType: string;
  targetValue?: string;
  result: 'passed' | 'failed' | 'broken';
  metrics: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  command: string;
  executedBy: string;
  reportPath?: string;
  allurePath?: string;
  logsPath?: string;
  hasScreenshots?: boolean;
  hasVideos?: boolean;
  hasTraces?: boolean;
}

export interface ScenarioInfo {
  name: string;
  line: number;
  tags: string[];
  type: 'Scenario' | 'Scenario Outline';
  featureName: string;
  featureFile: string;
}

export interface FeatureInfo {
  file: string; // relative path
  name: string;
  description: string;
  scenarioCount: number;
  tags: string[];
  scenarios: ScenarioInfo[];
}

export interface ConfigSettings {
  frameworkPath: string;
  playwrightPath: string;
  reportPath: string;
  defaultBrowser: 'chromium' | 'firefox' | 'webkit';
  defaultEnvironment: 'dev' | 'qa' | 'sit' | 'uat' | 'prod';
  defaultTimeout: number;
  defaultHeadless: boolean;
  theme: 'light' | 'dark';
  notifications: {
    desktop: boolean;
    slackWebhook: string;
    teamsWebhook: string;
    emailRecipient: string;
  };
}

export interface CronSchedule {
  id: string;
  name: string;
  cronExpression: string;
  request: TestRunRequest;
  active: boolean;
  lastRun?: string;
  nextRun?: string;
}
