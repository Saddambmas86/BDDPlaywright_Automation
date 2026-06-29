import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  metrics: {
    passed: number;
    failed: number;
    skipped: number;
  };
  trend: any[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({ metrics, trend }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#b0b3b8' : '#6c757d';
  const gridColor = isDark ? '#2a2a3e' : '#dee2e6';

  // Pie Chart Data
  const pieData = {
    labels: ['Passed', 'Failed', 'Skipped'],
    datasets: [
      {
        data: [metrics.passed, metrics.failed, metrics.skipped],
        backgroundColor: [
          'rgba(52, 199, 89, 0.85)',  // Apple green
          'rgba(255, 59, 48, 0.85)',   // Apple red
          'rgba(255, 149, 0, 0.85)'   // Apple orange
        ],
        borderColor: isDark ? '#161624' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: { family: 'inherit', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw} tests`
        }
      }
    }
  };

  // Bar Chart Data (Suite Types distribution)
  const barData = {
    labels: ['Smoke', 'Regression', 'Sanity', 'Critical', 'Adhoc/Tags'],
    datasets: [
      {
        label: 'Executions',
        data: [
          trend.filter(t => t.suiteType === 'smoke').length,
          trend.filter(t => t.suiteType === 'regression').length,
          trend.filter(t => t.suiteType === 'sanity').length,
          trend.filter(t => t.suiteType === 'critical').length,
          trend.filter(t => !['smoke', 'regression', 'sanity', 'critical'].includes(t.suiteType)).length,
        ],
        backgroundColor: 'rgba(88, 86, 214, 0.8)', // accent color
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0 }
      }
    }
  };

  // Trend Line Chart Data
  const lineLabels = trend.map(t => new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const passRates = trend.map(t => {
    const total = t.passed + t.failed + t.skipped;
    return total > 0 ? Math.round((t.passed / total) * 100) : 0;
  });

  const lineData = {
    labels: lineLabels.length > 0 ? lineLabels : ['No Runs'],
    datasets: [
      {
        label: 'Pass Rate %',
        data: passRates.length > 0 ? passRates : [0],
        fill: true,
        backgroundColor: 'rgba(123, 121, 255, 0.1)',
        borderColor: 'rgba(123, 121, 255, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(123, 121, 255, 1)',
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Pass Rate: ${context.raw}%`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      },
      y: {
        grid: { color: gridColor },
        ticks: { 
          color: textColor,
          callback: (value: any) => `${value}%`
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="row g-4 mb-4">
      {/* Doughnut Pie chart */}
      <div className="col-md-4">
        <div className="dashboard-card h-100 p-4">
          <h5 className="fw-bold mb-3" style={{ fontSize: '16px' }}>Result Breakdown</h5>
          <div style={{ height: '220px', position: 'relative' }}>
            {metrics.passed + metrics.failed + metrics.skipped > 0 ? (
              <Doughnut data={pieData} options={pieOptions} />
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                No execution statistics available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="col-md-4">
        <div className="dashboard-card h-100 p-4">
          <h5 className="fw-bold mb-3" style={{ fontSize: '16px' }}>Pass Rate Trend</h5>
          <div style={{ height: '220px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="col-md-4">
        <div className="dashboard-card h-100 p-4">
          <h5 className="fw-bold mb-3" style={{ fontSize: '16px' }}>Suite Distribution</h5>
          <div style={{ height: '220px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
