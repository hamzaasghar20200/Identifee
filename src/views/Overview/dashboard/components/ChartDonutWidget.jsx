import React from 'react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';
import { Chart } from 'react-chartjs-2';
ChartJS.register(ChartDataLabels);

const ChartDonutWidget = ({
  data,
  style = { height: 150, width: '100%' },
  clazz,
  dataLabelsConfig = { display: false },
}) => {
  const { type } = data; // chart type
  const config = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: dataLabelsConfig,
      legend: {
        position: data.legendPosition,
        labels: {
          usePointStyle: true,
          boxWidth: 7,
          boxHeight: 7,
          font: {
            size: 9,
          },
        },
      },
      tooltip: true,
    },
  };
  return (
    <div style={style} className={clazz}>
      <Chart type={type} options={config} data={data} />
    </div>
  );
};

export default ChartDonutWidget;
