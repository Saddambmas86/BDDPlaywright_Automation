# 🚀 Complete Setup Guide for New Machine

This guide provides all commands needed to set up the Playwright BDD Dashboard on a new machine.

---

## 📋 Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Windows/Mac/Linux** OS

### Verify Installation
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v9.0.0 or higher
git --version     # Any recent version
```

---

## 📦 Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Saddambmas86/BDDPlaywright_Automation.git
cd BDDPlaywright_Automation
```

---

## 🔧 Step 2: Install Root Dependencies

```bash
# Install all root-level dependencies
npm install
```

**This installs:**
- Cucumber.js
- Playwright
- Allure reporters
- TypeScript
- And all other dev dependencies

---

## 🎭 Step 3: Install Playwright Browsers

```bash
# Install Playwright browsers and dependencies
npx playwright install
```

**On Linux, you may also need:**
```bash
npx playwright install-deps
```

---

## 🗄️ Step 4: Install Dashboard Dependencies

```bash
# Install backend dependencies
cd dashboard/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ../..
```

---

## 🏗️ Step 5: Build the Dashboard Frontend

```bash
cd dashboard/frontend
npm run build
cd ../..
```

**This creates the production-ready frontend in `dashboard/backend/public/`**

---

## ✅ Step 6: Verify Setup

### Test 1: Check Cucumber Installation
```bash
npx cucumber-js --version
```
**Expected output:** Version number (e.g., `10.9.0`)

### Test 2: Check Allure Installation
```bash
npx allure --version
```
**Expected output:** Version number (e.g., `2.29.0`)

### Test 3: Check TypeScript Compilation
```bash
cd dashboard/backend
npx tsc --noEmit
cd ../..
```
**Expected:** No errors

---

## 🚀 Step 7: Start the Dashboard

### Option A: Using Startup Script (Recommended)

**Windows:**
```bash
# Double-click this file in File Explorer
dashboard\start-dashboard.bat
```

**Or from command line:**
```bash
dashboard\start-dashboard.bat
```

**Linux/Mac:**
```bash
chmod +x dashboard/start-dashboard.sh
./dashboard/start-dashboard.sh
```

### Option B: Manual Start

**Terminal 1 - Start Backend:**
```bash
cd dashboard/backend
npm start
```

**Expected output:**
```
🚀═══════════════════════════════════════════════════════🚀
        Dashboard Backend listening on port 3001
        API Endpoint: http://localhost:3001/api
        Frontend UI: http://localhost:3001
🚀═══════════════════════════════════════════════════════🚀
```

---

## 🌐 Step 8: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3001
```

You should see the **Test Execution Dashboard** with:
- Executive Summary
- Feature Summary
- Scenario Details
- Failed Tests
- Tag Analytics
- Environment Info

---

## 🧪 Step 9: Run Your First Test

### From the Dashboard UI:
1. Go to **Execute Tests** page
2. Select suite type (e.g., "Smoke Tests")
3. Choose browser and environment
4. Click **"Run Automation Suite"**
5. Watch the live console output

### From Command Line:
```bash
# Run all tests
npm test

# Run smoke tests
npm run test:smoke

# Run specific tag
npm run test:tag -- --tags @auth

# Run specific scenario
npm run test:scenario -- --name "User should validate Text"
```

---

## 📊 Step 10: View Reports

### After test execution completes:

**Allure Report:**
```bash
# Generate and open Allure report
npm run allure:open

# Or serve without generating
npm run allure:serve
```

**Cucumber HTML Report:**
```bash
# Open in browser (if configured)
start reports/cucumber-report.html
```

**Dashboard Reports:**
- Navigate to **Reports** page in the dashboard
- Or go to: `http://localhost:3001/reports`

---

## 🔨 Common Commands Reference

### Test Execution Commands

```bash
# Run all tests
npm test

# Run by tag
npm run test:smoke          # @smoke tag
npm run test:regression     # @regression tag
npm run test:sanity         # @sanity tag
npm run test:critical       # @critical tag

# Run by environment
npm run test:dev            # dev environment
npm run test:qa             # qa environment
npm run test:sit            # sit environment
npm run test:uat            # uat environment
npm run test:prod           # prod environment

# Run by browser
npm run test:chromium       # Chrome
npm run test:firefox        # Firefox
npm run test:webkit         # Safari

# Run with options
npm run test:parallel       # Parallel execution (4 workers)
npm run test:parallel:2     # 2 workers
npm run test:parallel:8     # 8 workers
npm run test:retry:2        # Retry failed tests 2 times
npm run test:headed         # Run with browser visible
npm run test:headless       # Run headless (default)

# Run specific scenario/feature
npm run test:scenario -- --name "Scenario Name"
npm run test:feature -- features/api.feature
npm run test:tag -- --tags @customTag
```

### Report Commands

```bash
# Allure commands
npm run allure:generate     # Generate Allure report
npm run allure:open         # Generate and open
npm run allure:serve        # Serve without generating
npm run allure:clean        # Clean Allure results

# Convert reports
npm run convert:allure      # Convert Cucumber JSON to Allure

# View reports
npm run report              # Generate and open Allure report
```

### Dashboard Commands

```bash
# Start dashboard (production)
npm run dashboard:start

# Build dashboard frontend
npm run dashboard:build

# Start dashboard in dev mode (with hot reload)
npm run dashboard:dev
```

### Clean Commands

```bash
# Clean all reports
npm run clean

# Clean only reports
npm run clean:reports

# Clean only Allure
npm run clean:allure
```

---

## 🐛 Troubleshooting

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Change port in dashboard/backend/.env
PORT=3002
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For dashboard
cd dashboard/backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### Issue: "Playwright browsers not found"

**Solution:**
```bash
npx playwright install
```

### Issue: "TypeScript compilation errors"

**Solution:**
```bash
# Clean and rebuild
cd dashboard/backend
rm -rf dist
npm run build
```

### Issue: "Allure clean not working"

**Solution:**
```bash
# Manual clean
rm -rf allure-results allure-report

# Or use npm
npm run allure:clean
```

### Issue: "Dashboard not loading"

**Solution:**
```bash
# Rebuild frontend
cd dashboard/frontend
npm run build

# Restart backend
cd ../backend
npm start
```

---

## 📁 Project Structure

```
BDDPlaywright_Automation/
├── features/                    # Feature files
│   ├── api.feature
│   ├── DummyBDD.feature
│   └── textCompare.feature
├── stepDefinitions/             # Step definitions
│   ├── apiSteps.ts
│   ├── commonSteps.ts
│   └── ...
├── hooks/                       # Cucumber hooks
│   └── hooks.ts
├── pages/                       # Page Object Model
│   ├── BasePage.ts
│   └── ...
├── utils/                       # Utilities
│   ├── ConfigReader.ts
│   └── ...
├── dashboard/                   # Dashboard application
│   ├── backend/                 # Express.js backend
│   │   ├── src/
│   │   │   ├── index.ts        # Server entry
│   │   │   ├── executor.ts     # Test executor
│   │   │   ├── reportParser.ts # Report parser
│   │   │   └── ...
│   │   ├── .env                # Backend config
│   │   └── package.json
│   ├── frontend/                # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── pages/          # Page components
│   │   │   └── ...
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── shared/                  # Shared types
│   │   └── types.ts
│   ├── start-dashboard.bat     # Windows startup
│   └── start-dashboard.sh      # Linux/Mac startup
├── package.json                 # Root package.json
├── cucumber.js                  # Cucumber config
├── playwright.config.ts         # Playwright config
└── .env                         # Environment variables
```

---

## 🔐 Environment Variables

### Root `.env` file
```env
# Environment
NODE_ENV=dev

# Database (if using)
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=YourPassword
DB_NAME=TestDB

# Dashboard
DASHBOARD_PORT=3001
```

### Dashboard Backend `.env` file (`dashboard/backend/.env`)
```env
PORT=3001
FRAMEWORK_PATH=D:/BDD_Playwright
REPORT_PATH=./reports
ALLURE_RESULTS_PATH=./allure-results
```

---

## 📝 Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] `npm install` run in root
- [ ] `npx playwright install` executed
- [ ] Dashboard dependencies installed (`cd dashboard/backend && npm install && cd ../frontend && npm install`)
- [ ] Frontend built (`cd dashboard/frontend && npm run build`)
- [ ] Dashboard started (`dashboard\start-dashboard.bat` or `npm start` in backend)
- [ ] Browser opened to `http://localhost:3001`
- [ ] First test executed successfully

---

## 🎯 Next Steps

1. **Configure Environment:** Update `.env` files with your settings
2. **Add Feature Files:** Create `.feature` files in `features/` folder
3. **Add Step Definitions:** Implement steps in `stepDefinitions/`
4. **Configure Tests:** Update `config/env.ts` with your test data
5. **Run Tests:** Use dashboard or CLI commands
6. **View Reports:** Check Allure and dashboard reports

---

## 📚 Additional Resources

- **Cucumber.js Docs:** https://cucumber.io/docs/cucumber/
- **Playwright Docs:** https://playwright.dev/
- **Allure Reports:** https://docs.qameta.io/allure/
- **Dashboard README:** `dashboard/README.md`

---

## 🆘 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review logs in the dashboard console
3. Check `dashboard/backend/logs/` folder
4. Ensure all prerequisites are installed
5. Verify environment variables are set correctly

---

**Happy Testing! 🎭**