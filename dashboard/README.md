# Playwright + Cucumber BDD Test Execution Dashboard

A modern, responsive Test Execution Dashboard for Playwright + Cucumber BDD + TypeScript automation framework. Built with React, Express.js, and Chart.js for comprehensive test reporting and analytics.

## 📊 Features

### Executive Summary
- **Total Scenarios** - Count of all automated scenarios
- **Pass/Fail/Skipped** - Detailed test results breakdown
- **Pass Percentage** - Overall success rate
- **Execution Duration** - Total test execution time
- **Start/End Time** - Execution timeline
- **Browser & Environment** - Test execution context
- **Build Number & Git Branch** - CI/CD integration

### Interactive Charts
- **Pie Chart** - Pass/Fail/Skipped distribution
- **Bar Chart** - Feature-wise results
- **Line Chart** - Execution trend over time
- **Browser Distribution** - Cross-browser execution stats
- **Daily Trend** - Day-wise execution metrics

### Detailed Reports
- **Feature Summary** - Complete feature-wise breakdown with sorting, filtering, and pagination
- **Scenario Details** - Individual scenario results with media links (screenshots, videos, traces)
- **Failed Tests** - Comprehensive failure analysis with error stack traces and retry history
- **Tag Analytics** - Execution grouped by tags (@smoke, @regression, @sanity, @critical, etc.)
- **Environment Info** - System details (OS, Node.js, Playwright, Browser versions)

### Advanced Features
- **Real-time Updates** - WebSocket-based live execution monitoring
- **Search & Filter** - Advanced filtering by status, feature, tag, browser, environment
- **Export Options** - CSV export for all reports
- **Responsive Design** - Mobile-friendly interface with dark/light theme
- **Execution Queue** - Manage multiple test runs
- **Build History** - Track execution trends over time

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - REST API framework
- **TypeScript** - Type-safe development
- **WebSocket (ws)** - Real-time communication
- **node-cron** - Scheduled test execution

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Bootstrap 5** - Responsive CSS framework
- **Chart.js** - Data visualization
- **React Router** - Navigation
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Testing Framework
- **Playwright** - Browser automation
- **Cucumber BDD** - Behavior-driven development
- **TypeScript** - Test scripting

## 📁 Project Structure

```
dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── routes.ts             # Main API routes
│   │   ├── reportRoutes.ts       # Report-specific API routes
│   │   ├── reportParser.ts       # Cucumber JSON parser
│   │   ├── historyStore.ts       # Execution history management
│   │   ├── executor.ts           # Test execution engine
│   │   ├── scheduler.ts          # Cron job scheduler
│   │   ├── notifications.ts      # Alert system
│   │   └── featuresParser.ts     # Feature file parser
│   ├── data/                     # Runtime data storage
│   │   ├── history.json          # Execution history
│   │   ├── settings.json         # Configuration
│   │   └── logs/                 # Execution logs
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── main.tsx              # React entry point
│   │   ├── index.css             # Global styles
│   │   ├── components/
│   │   │   ├── DashboardCharts.tsx  # Chart.js components
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   └── Navbar.tsx           # Top navigation bar
│   │   ├── context/
│   │   │   └── ExecutionContext.tsx # WebSocket & state management
│   │   └── pages/
│   │       ├── EnhancedDashboard.tsx    # Main dashboard
│   │       ├── FeatureSummaryPage.tsx   # Feature reports
│   │       ├── ScenarioDetailsPage.tsx  # Scenario details
│   │       ├── FailedTestsPage.tsx      # Failed tests analysis
│   │       ├── TagAnalyticsPage.tsx     # Tag-wise analytics
│   │       ├── EnvironmentInfoPage.tsx  # Environment details
│   │       ├── ExecutePage.tsx          # Test execution
│   │       ├── HistoryPage.tsx          # Execution history
│   │       ├── ReportsPage.tsx          # Reports hub
│   │       ├── SchedulerPage.tsx        # Cron scheduler
│   │       ├── SettingsPage.tsx         # Configuration
│   │       └── LoginPage.tsx            # Authentication
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── shared/
│   └── types.ts                  # TypeScript interfaces
│
├── config/
│   └── default-settings.json     # Default configuration
│
├── sample-data/
│   └── cucumber-report.json      # Sample report for testing
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- Playwright browsers (will be installed automatically)
- Git (optional, for commit tracking)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd BDD_Playwright/dashboard
```

### Step 2: Install Backend Dependencies
```bash
cd dashboard/backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Install Playwright Browsers
```bash
cd ../..
npx playwright install
```

### Step 5: Configure Settings
Edit `dashboard/config/default-settings.json` or configure via dashboard UI:

```json
{
  "frameworkPath": "/path/to/your/playwright/project",
  "playwrightPath": "npx playwright",
  "reportPath": "./reports",
  "defaultBrowser": "chromium",
  "defaultEnvironment": "qa",
  "defaultTimeout": 30000,
  "defaultHeadless": true,
  "theme": "dark",
  "notifications": {
    "desktop": true,
    "slackWebhook": "",
    "teamsWebhook": "",
    "emailRecipient": ""
  }
}
```

### Step 6: Build Frontend
```bash
cd frontend
npm run build
```

### Step 7: Start Backend Server
```bash
cd ../backend
npm start
```

The dashboard will be available at `http://localhost:3001`

## 📖 Usage

### Starting the Dashboard

1. **Development Mode** (with hot reload):
   ```bash
   # Terminal 1 - Backend
   cd dashboard/backend
   npm run build
   npm start
   
   # Terminal 2 - Frontend (Vite dev server on port 3000)
   cd dashboard/frontend
   npm run dev
   ```

2. **Production Mode**:
   ```bash
   cd dashboard/frontend
   npm run build
   
   cd ../backend
   npm start
   ```

### Accessing the Dashboard
- Open browser to `http://localhost:3001`
- Default login: Automation Lead (Admin role)
- Session persists until browser is closed

### Running Tests

1. Navigate to **Execute Tests** page
2. Select test configuration:
   - **Suite Type**: Smoke, Regression, Sanity, Critical, or Custom
   - **Browser**: Chromium, Firefox, or WebKit
   - **Environment**: Dev, QA, SIT, UAT, or Prod
   - **Headless Mode**: On/Off
   - **Parallel Execution**: Enable/Disable
   - **Workers**: Number of parallel workers
   - **Retries**: Number of retry attempts
3. Click **Execute** to start test run
4. Monitor real-time progress on dashboard

### Viewing Reports

After test execution, reports are automatically generated:

1. **Feature Summary** - Overview of all features
2. **Scenario Details** - Individual scenario results
3. **Failed Tests** - Detailed failure analysis
4. **Tag Analytics** - Tag-wise performance
5. **Environment Info** - System configuration

### Exporting Data

All report pages support CSV export:
- Click **Export CSV** button on any report page
- File downloads with timestamp: `report-name-YYYY-MM-DD.csv`

## 🔌 API Endpoints

### Dashboard APIs
```
GET  /api/dashboard              # Dashboard summary statistics
GET  /api/history                # Execution history
GET  /api/status                 # Current execution status
POST /api/execute                # Queue test execution
POST /api/stop                   # Stop running execution
```

### Report APIs
```
GET  /api/reports/summary        # Comprehensive execution summary
GET  /api/reports/features       # Feature-wise results
GET  /api/reports/scenarios      # All scenario details
GET  /api/reports/failed         # Failed test details
GET  /api/reports/tags           # Tag analytics
GET  /api/reports/timeline       # Execution timeline
GET  /api/reports/environment    # Environment information
GET  /api/reports/trend          # Execution trend data
```

### Chart Data APIs
```
GET  /api/reports/charts/pie     # Pie chart data (Pass/Fail/Skipped)
GET  /api/reports/charts/bar     # Bar chart data (Feature-wise)
GET  /api/reports/charts/line    # Line chart data (Trend)
GET  /api/reports/charts/browser # Browser distribution
GET  /api/reports/charts/daily   # Daily execution trend
```

### Feature & Scenario APIs
```
GET  /api/features               # List all features
GET  /api/scenarios              # List all scenarios
```

### Configuration APIs
```
GET  /api/config                 # Get current configuration
POST /api/config                 # Save configuration
```

### Schedule APIs
```
GET    /api/schedules            # List all schedules
POST   /api/schedules            # Create new schedule
PUT    /api/schedules/:id        # Update schedule
DELETE /api/schedules/:id        # Delete schedule
POST   /api/schedules/:id/toggle # Toggle schedule active state
```

### Static Files
```
GET  /reports/screenshots/:file  # Access screenshots
GET  /reports/videos/:file       # Access videos
GET  /reports/traces/:file       # Access trace files
GET  /allure-report              # Allure report viewer
```

## 📊 Report Formats

### Cucumber JSON Report
The dashboard automatically parses `cucumber-report.json`:

```json
[
  {
    "keyword": "Feature",
    "name": "Feature Name",
    "tags": [{"name": "@smoke"}],
    "elements": [
      {
        "keyword": "Scenario",
        "name": "Scenario Name",
        "steps": [
          {
            "keyword": "Given ",
            "name": "Step description",
            "result": {
              "status": "passed",
              "duration": 1200000000
            }
          }
        ]
      }
    ]
  }
]
```

### Execution History
Stored in `dashboard/backend/data/history.json`:

```json
{
  "id": "run_1234567890",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 125000,
  "environment": "qa",
  "browser": "chromium",
  "suiteType": "regression",
  "result": "passed",
  "metrics": {
    "total": 50,
    "passed": 48,
    "failed": 2,
    "skipped": 0
  }
}
```

## ⚙️ Configuration

### Environment Variables
Create `.env` file in `dashboard/backend/`:

```env
PORT=3001
GIT_BRANCH=main
BUILD_NUMBER=123
```

### Dashboard Settings
Access via **Settings** page or edit `dashboard/backend/data/settings.json`:

```json
{
  "frameworkPath": "/absolute/path/to/playwright/project",
  "playwrightPath": "npx playwright",
  "reportPath": "./reports",
  "defaultBrowser": "chromium",
  "defaultEnvironment": "qa",
  "defaultTimeout": 30000,
  "defaultHeadless": true,
  "theme": "dark",
  "notifications": {
    "desktop": true,
    "slackWebhook": "https://hooks.slack.com/...",
    "teamsWebhook": "https://outlook.office.com/webhook/...",
    "emailRecipient": "team@example.com"
  }
}
```

## 🔄 WebSocket Events

The dashboard uses WebSocket for real-time updates:

### Client → Server
- Connection established automatically

### Server → Client
```typescript
{
  "type": "status_update",
  "status": {
    "status": "running" | "idle" | "queued",
    "progress": 45,
    "completedScenarios": 22,
    "totalScenarios": 50,
    "currentFeature": "Feature Name",
    "currentScenario": "Scenario Name",
    "runId": "run_1234567890"
  }
}

{
  "type": "queue_update",
  "queue": [...]
}

{
  "type": "log",
  "data": "Console output..."
}
```

## 🎨 Theming

### Dark/Light Theme
Toggle theme via Settings page or browser DevTools:
```javascript
// Toggle theme
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme', 'light');
```

### Custom CSS Variables
Override in `dashboard/frontend/src/index.css`:

```css
:root {
  --primary-color: #5856d6;
  --success-color: #34c759;
  --danger-color: #ff3b30;
  --warning-color: #ff9500;
  --info-color: #007aff;
  --bg-dark: #161624;
  --bg-light: #f5f5f7;
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet**: 576px - 992px
- **Desktop**: > 992px

## 🧪 Sample Data

Sample cucumber report available at `dashboard/sample-data/cucumber-report.json`:

- 4 Features
- 9 Scenarios (7 Passed, 1 Failed, 1 Skipped)
- Multiple tags (@smoke, @regression, @critical, @sanity)
- Error messages and stack traces

To use sample data:
```bash
# Copy sample report to your reports directory
cp dashboard/sample-data/cucumber-report.json /path/to/your/project/reports/
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <pid> /F

# Or change port in .env
PORT=3002
```

### Frontend build fails
```bash
# Clear cache and reinstall
cd dashboard/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Reports not showing
1. Ensure `cucumber-report.json` exists in `reports/` directory
2. Check file permissions
3. Verify `frameworkPath` in settings points to correct project root
4. Check browser console for API errors

### WebSocket connection failed
- Ensure backend is running on port 3001
- Check firewall settings
- Verify no proxy blocking WebSocket connections

## 🚀 Production Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd dashboard/backend
pm2 start dist/index.js --name "dashboard-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
# Dockerfile.example
FROM node:18-alpine
WORKDIR /app
COPY dashboard/backend/package*.json ./
RUN npm ci --only=production
COPY dashboard/backend/dist ./dist
COPY dashboard/frontend/dist ./public
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name dashboard.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 Performance Optimization

### Backend
- Enable gzip compression
- Use Redis for session storage
- Implement API rate limiting
- Cache frequently accessed data

### Frontend
- Enable code splitting
- Lazy load report pages
- Optimize bundle size
- Use CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Senior QA Automation Architect & Full Stack Developer**

## 🙏 Acknowledgments

- Playwright - Browser automation framework
- Cucumber - BDD framework
- React - UI library
- Express.js - Web framework
- Chart.js - Charting library
- Bootstrap - CSS framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@example.com
- Slack: #qa-automation-support

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js >= 16.x
- [ ] Clone repository
- [ ] Install backend dependencies (`cd dashboard/backend && npm install`)
- [ ] Install frontend dependencies (`cd dashboard/frontend && npm install`)
- [ ] Install Playwright browsers (`npx playwright install`)
- [ ] Configure `dashboard/config/default-settings.json`
- [ ] Build frontend (`cd dashboard/frontend && npm run build`)
- [ ] Start backend (`cd dashboard/backend && npm start`)
- [ ] Open `http://localhost:3001` in browser
- [ ] Run sample tests to see dashboard in action

## 📊 Dashboard Features Overview

| Feature | Description | Status |
|---------|-------------|--------|
| Executive Summary | Total scenarios, pass/fail/skip counts, duration | ✅ Implemented |
| Pie Chart | Pass/Fail/Skipped distribution | ✅ Implemented |
| Bar Chart | Feature-wise results | ✅ Implemented |
| Line Chart | Execution trend over time | ✅ Implemented |
| Feature Summary Table | Sortable, filterable, paginated | ✅ Implemented |
| Scenario Details | Full scenario info with media links | ✅ Implemented |
| Failed Tests Analysis | Error traces, screenshots, videos | ✅ Implemented |
| Tag Analytics | Tag-wise performance metrics | ✅ Implemented |
| Environment Info | System configuration details | ✅ Implemented |
| Search & Filter | Advanced filtering capabilities | ✅ Implemented |
| CSV Export | Export all reports to CSV | ✅ Implemented |
| Real-time Updates | WebSocket live monitoring | ✅ Implemented |
| Dark/Light Theme | Theme switching | ✅ Implemented |
| Responsive Design | Mobile-friendly interface | ✅ Implemented |
| Execution Queue | Manage multiple test runs | ✅ Implemented |
| Build History | Track execution trends | ✅ Implemented |

---

**Built with ❤️ for the QA Automation Community**