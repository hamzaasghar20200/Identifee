import { Line } from 'react-chartjs-2';
import React from 'react';

const config = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
    tooltip: true,
  },
};
const ChartLineWidget = ({ data, style = { height: 150, width: 300 } }) => {
  return (
    <div style={style}>
      <Line options={config} data={data} />
    </div>
  );
};

export default ChartLineWidget;
