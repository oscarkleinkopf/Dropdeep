let trendChartInstance = null;
let sentimentChartInstance = null;
let projectionChartInstance = null;

export function initTrendChart() {
  const ctx = document.getElementById('trend-chart-canvas');
  if (!ctx) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  // Draw simulated line chart
  const months = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const dataValues = Array.from({ length: 12 }, () => Math.round(30 + Math.random() * 70));
  dataValues[11] = 98; // ensure peak trend at current month
  dataValues[10] = 85;

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Volumen de Búsqueda (Google + Foros)',
        data: dataValues,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: '#8b5cf6',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#9ca3af' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#9ca3af' }, min: 0, max: 100 }
      }
    }
  });
}

// Chart.js - Radar/Doughnut Sentiment Chart
export function initSentimentChart() {
  const ctx = document.getElementById('sentiment-chart-canvas');
  if (!ctx) return;

  if (sentimentChartInstance) {
    sentimentChartInstance.destroy();
  }

  sentimentChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Dificultad de Uso', 'Altas Expectativas', 'Efectos Secundarios', 'Fragilidad/Ruptura', 'Satisfacción Total'],
      datasets: [{
        data: [15, 25, 10, 20, 30],
        backgroundColor: [
          'rgba(245, 158, 11, 0.6)', // Amber
          'rgba(139, 92, 246, 0.6)',  // Violet
          'rgba(239, 68, 68, 0.6)',   // Red
          'rgba(107, 114, 128, 0.6)', // Muted gray
          'rgba(16, 185, 129, 0.6)'   // Emerald
        ],
        borderColor: '#111625',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } }
        }
      }
    }
  });
}

// Chart.js - profit-projection-chart Line Chart
export function initProjectionChart(dailyProfit) {
  const ctx = document.getElementById('profit-projection-chart');
  if (!ctx) return;

  if (projectionChartInstance) {
    projectionChartInstance.destroy();
  }

  // Create labels for 30 days (Day 5 to Day 30)
  const labels = Array.from({ length: 6 }, (_, i) => `Día ${(i + 1) * 5}`);
  const dataValues = Array.from({ length: 6 }, (_, i) => Math.round(dailyProfit * (i + 1) * 5));

  projectionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Beneficio Acumulado ($)',
        data: dataValues,
        borderColor: '#a78bfa', // purple
        backgroundColor: 'rgba(167, 139, 250, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
        tension: 0.2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.02)' }, ticks: { color: '#9ca3af', font: { size: 9 } } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.02)' }, ticks: { color: '#9ca3af', font: { size: 9 } } }
      }
    }
  });
}
