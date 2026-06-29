import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';
import { CronSchedule, TestRunRequest } from '../../shared/types';
import { TestExecutor } from './executor';

const SCHEDULES_FILE = path.join(__dirname, '../data/schedules.json');
const cronTasks = new Map<string, cron.ScheduledTask>();

/**
 * Ensure schedules database file exists
 */
function ensureSchedulesFile(): void {
  const dir = path.dirname(SCHEDULES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SCHEDULES_FILE)) {
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Read schedules
 */
export function getSchedules(): CronSchedule[] {
  ensureSchedulesFile();
  try {
    const content = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading schedules:', error);
    return [];
  }
}

/**
 * Save schedules
 */
export function saveSchedules(schedules: CronSchedule[]): void {
  ensureSchedulesFile();
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8');
}

/**
 * Start cron runner for a schedule
 */
export function startCronTask(schedule: CronSchedule): void {
  // Stop existing cron task if it exists
  if (cronTasks.has(schedule.id)) {
    cronTasks.get(schedule.id)!.stop();
    cronTasks.delete(schedule.id);
  }

  if (!schedule.active) return;

  try {
    // Validate cron expression
    if (!cron.validate(schedule.cronExpression)) {
      console.error(`Invalid cron expression for schedule ${schedule.name}: ${schedule.cronExpression}`);
      return;
    }

    const task = cron.schedule(schedule.cronExpression, () => {
      console.log(`⏰ Scheduled test execution triggered: ${schedule.name} (${schedule.cronExpression})`);
      
      // Inject schedule name into execution executedBy
      const request: TestRunRequest = { ...schedule.request };
      
      // Queue run
      TestExecutor.enqueue(request);

      // Update schedule run history timestamps
      const schedules = getSchedules();
      const match = schedules.find(s => s.id === schedule.id);
      if (match) {
        match.lastRun = new Date().toISOString();
        saveSchedules(schedules);
      }
    });

    task.start();
    cronTasks.set(schedule.id, task);
    console.log(`✓ Loaded schedule cron: ${schedule.name} [${schedule.cronExpression}]`);
  } catch (e) {
    console.error(`Failed to start cron task for schedule ${schedule.id}:`, e);
  }
}

/**
 * Initialize all active schedules on application startup
 */
export function initScheduler(): void {
  ensureSchedulesFile();
  const schedules = getSchedules();
  console.log(`🤖 Initializing scheduler: Loading ${schedules.length} schedules...`);
  schedules.forEach(schedule => {
    if (schedule.active) {
      startCronTask(schedule);
    }
  });
}

/**
 * Stop all cron runners
 */
export function stopAllSchedulerTasks(): void {
  cronTasks.forEach(task => task.stop());
  cronTasks.clear();
}
