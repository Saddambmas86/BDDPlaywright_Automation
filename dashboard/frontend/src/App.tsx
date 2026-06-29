import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExecutionProvider, useExecution } from './context/ExecutionContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './pages/DashboardHome';
import { ExecutePage } from './pages/ExecutePage';
import { FeatureBrowser } from './pages/FeatureBrowser';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { EnhancedDashboard } from './pages/EnhancedDashboard';
import { FeatureSummaryPage } from './pages/FeatureSummaryPage';
import { ScenarioDetailsPage } from './pages/ScenarioDetailsPage';
import { FailedTestsPage } from './pages/FailedTestsPage';
import { TagAnalyticsPage } from './pages/TagAnalyticsPage';
import { EnvironmentInfoPage } from './pages/EnvironmentInfoPage';

const AppContent: React.FC = () => {
  const { currentUser } = useExecution();

  if (!currentUser) {
    return (
      <div className="container py-5">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<EnhancedDashboard />} />
          <Route path="/execute" element={<ExecutePage />} />
          <Route path="/features" element={<FeatureBrowser />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/features" element={<FeatureSummaryPage />} />
          <Route path="/reports/scenarios" element={<ScenarioDetailsPage />} />
          <Route path="/reports/failed" element={<FailedTestsPage />} />
          <Route path="/reports/tags" element={<TagAnalyticsPage />} />
          <Route path="/reports/environment" element={<EnvironmentInfoPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ExecutionProvider>
      <Router>
        <AppContent />
      </Router>
    </ExecutionProvider>
  );
};

export default App;
