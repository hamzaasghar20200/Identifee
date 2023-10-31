import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import React from 'react';
import { Chart as ChartJS } from 'chart.js';
ChartJS.register(ChartDataLabels);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  borderRadius: 2,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      position: 'nearest',
      callbacks: {
        label: function ({ raw }) {
          return raw;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        minRotation: 0,
      },
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
    y: {
      beginAtZero: true,
      position: 'right',
    },
  },
};

const ChartColumnWidget = ({ type = 'compressed', data }) => {
  const barThickness = type === 'compressed' ? 0.8 : 0.25;
  const chartData = data || {
    labels: [
      'Mar 2022',
      'Apr 2022',
      'May 2022',
      'Jun 2022',
      'Jul 2022',
      'Aug 2022',
      'Sep 2022',
    ],
    datasets: [
      {
        label: 'open',
        backgroundColor: '#082ace',
        data: [0, 0, 4, 0, 7, 12, 28],
      },
      {
        label: 'lost',
        backgroundColor: '#28ae60',
        data: [20, 10, 0, 0, 0, 0, 0],
      },
      {
        label: 'won',
        backgroundColor: '#FF5A2D',
        data: [0, 0, 0, 10, 22, 0, 1],
      },
    ],
    style: { height: '100%', width: '100%' },
  };
  return (
    <div style={data?.style || { height: '100%' }}>
      <Bar
        options={{ ...options, barPercentage: barThickness }}
        data={chartData}
      />
    </div>
  );
};

export default ChartColumnWidget;
