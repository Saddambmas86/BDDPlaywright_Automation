import * as https from 'https';
import { URL } from 'url';
import { ConfigSettings, ExecutionHistoryItem } from '../../shared/types';

/**
 * Send webhook notification to Slack or Teams using native Node https module
 */
function sendWebhook(webhookUrl: string, payload: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!webhookUrl) {
      resolve();
      return;
    }

    try {
      const parsedUrl = new URL(webhookUrl);
      const dataString = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': dataString.length,
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Webhook failed with status code ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(dataString);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Coordinate and send notifications for test executions
 */
export async function sendNotifications(item: ExecutionHistoryItem, settings: ConfigSettings): Promise<void> {
  const isPass = item.result === 'passed';
  const statusEmoji = isPass ? '✅' : item.result === 'failed' ? '❌' : '⚠️';
  const statusText = item.result.toUpperCase();

  const title = `${statusEmoji} Playwright BDD Test Execution: ${statusText}`;
  const messageText = `Run ID: ${item.id}
Environment: ${item.environment.toUpperCase()}
Browser: ${item.browser.toUpperCase()}
Suite: ${item.suiteType.toUpperCase()} ${item.targetValue ? `(${item.targetValue})` : ''}
Duration: ${(item.duration / 1000).toFixed(2)}s
Metrics: Total: ${item.metrics.total} | Passed: ${item.metrics.passed} | Failed: ${item.metrics.failed} | Skipped: ${item.metrics.skipped}`;

  console.log(`[Notification Manager] Preparing alerts for Run ${item.id}...`);

  // 1. Slack Webhook Notification
  if (settings.notifications.slackWebhook) {
    try {
      const slackPayload = {
        text: `*${title}*\n${messageText}`,
        attachments: [
          {
            color: isPass ? '#36a64f' : '#ff0000',
            fields: [
              { title: 'Passed', value: item.metrics.passed.toString(), short: true },
              { title: 'Failed', value: item.metrics.failed.toString(), short: true },
              { title: 'Skipped', value: item.metrics.skipped.toString(), short: true }
            ]
          }
        ]
      };
      await sendWebhook(settings.notifications.slackWebhook, slackPayload);
      console.log('✓ Slack notification sent successfully');
    } catch (err) {
      console.error('Failed to send Slack notification:', (err as Error).message);
    }
  }

  // 2. Microsoft Teams Webhook Notification
  if (settings.notifications.teamsWebhook) {
    try {
      const teamsPayload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: isPass ? '00FF00' : 'FF0000',
        summary: title,
        title: title,
        sections: [
          {
            activityTitle: 'Execution Details',
            facts: [
              { name: 'Run ID', value: item.id },
              { name: 'Environment', value: item.environment.toUpperCase() },
              { name: 'Browser', value: item.browser.toUpperCase() },
              { name: 'Suite', value: `${item.suiteType.toUpperCase()} ${item.targetValue ? `(${item.targetValue})` : ''}` },
              { name: 'Duration', value: `${(item.duration / 1000).toFixed(2)}s` },
              { name: 'Passed', value: item.metrics.passed.toString() },
              { name: 'Failed', value: item.metrics.failed.toString() },
              { name: 'Skipped', value: item.metrics.skipped.toString() }
            ]
          }
        ]
      };
      await sendWebhook(settings.notifications.teamsWebhook, teamsPayload);
      console.log('✓ MS Teams notification sent successfully');
    } catch (err) {
      console.error('Failed to send MS Teams notification:', (err as Error).message);
    }
  }

  // 3. Email Notification (Mock Service logs)
  if (settings.notifications.emailRecipient) {
    try {
      console.log(`
📧 ======================================================== 📧
  MOCK EMAIL DISPATCHED TO: ${settings.notifications.emailRecipient}
  SUBJECT: ${title}
  
  Dear Team,
  
  The automated test run has completed.
  
  ${messageText.replace(/\n/g, '\n  ')}
  
  Best regards,
  Playwright BDD Test Dashboard
📧 ======================================================== 📧
`);
    } catch (err) {
      console.error('Failed to send Email notification:', (err as Error).message);
    }
  }
}
