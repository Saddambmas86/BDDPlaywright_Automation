import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as ws from 'ws';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import apiRoutes from './routes';
import reportRoutes from './reportRoutes';
import { TestExecutor } from './executor';
import { initScheduler, stopAllSchedulerTasks } from './scheduler';
import { HistoryStore } from './historyStore';

const app = express();
const port = process.env.PORT || 3001;

// Load config
const settings = HistoryStore.getSettings();
const projectRoot = settings.frameworkPath;

// Setup Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);
app.use('/api/reports', reportRoutes);

// Serve cucumber HTML report and media directories from framework path
const reportsDir = path.resolve(path.join(projectRoot, 'reports'));
if (fs.existsSync(reportsDir)) {
  console.log(`✓ Serving reports directory: ${reportsDir}`);
  app.use('/reports', express.static(reportsDir));
} else {
  console.warn(`⚠ Reports directory not found at: ${reportsDir}`);
}

// Serve Allure report if it exists
const allureReportDir = path.resolve(path.join(projectRoot, 'allure-report'));
if (fs.existsSync(allureReportDir)) {
  console.log(`✓ Serving allure-report directory: ${allureReportDir}`);
  app.use('/allure-report', express.static(allureReportDir));
} else {
  console.warn(`⚠ Allure report directory not found at: ${allureReportDir}`);
}

// Serve Frontend static assets from frontend/dist
const frontendDistDir = path.resolve(path.join(__dirname, '../../frontend/dist'));
if (fs.existsSync(frontendDistDir)) {
  console.log(`✓ Serving frontend production build from: ${frontendDistDir}`);
  app.use(express.static(frontendDistDir));
  
  // Fallback all other routes to frontend index.html (SPA routing support)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/reports') || req.path.startsWith('/allure-report')) {
      return next();
    }
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
} else {
  console.warn(`⚠ Frontend production build not found at: ${frontendDistDir}. Run frontend build to package static assets.`);
}

// Create HTTP server
const server = http.createServer(app);

// Integrate WebSocket Server
const wss = new ws.Server({ server });
const clients = new Set<ws.WebSocket>();

wss.on('connection', (wsClient: ws.WebSocket) => {
  clients.add(wsClient);
  console.log(`📡 WebSocket Client connected (Total: ${clients.size})`);

  // Send current status immediately
  const status = TestExecutor.getStatus();
  wsClient.send(JSON.stringify({ type: 'status_update', status: status.current }));
  wsClient.send(JSON.stringify({ type: 'queue_update', queue: status.queue }));

  wsClient.on('close', () => {
    clients.delete(wsClient);
    console.log(`📡 WebSocket Client disconnected (Remaining: ${clients.size})`);
  });

  wsClient.on('error', (err) => {
    console.error('WebSocket Client error:', err);
    clients.delete(wsClient);
  });
});

// Configure TestExecutor to broadcast messages to all WebSocket clients
TestExecutor.setBroadcastCallback((data: any) => {
  const messageStr = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === ws.WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
});

// Initialize Scheduler
initScheduler();

// Start Server
server.listen(port, () => {
  console.log(`
🚀═══════════════════════════════════════════════════════🚀
        Dashboard Backend listening on port ${port}
        API Endpoint: http://localhost:${port}/api
        Frontend UI: http://localhost:${port}
🚀═══════════════════════════════════════════════════════🚀
`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  stopAllSchedulerTasks();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  stopAllSchedulerTasks();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
