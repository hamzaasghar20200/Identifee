import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

const funnelChart = {
  id: 'funnelChart',
  beforeDraw(chart, args, pluginOptions) {
    return true;
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  funnelChart
);

const options = {
  indexAxis: 'y',
  elements: {
    bar: {
      borderWidth: 1,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
    title: {
      display: false,
      text: '',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      stepSize: 0,
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: true,
        padding: 0,
      },
    },
  },
};

const ChartFunnelWidget = ({ data, style = { height: 150, width: 300 } }) => {
  const dataFunnel = {
    labels: data.labels,
    datasets: [
      {
        label: '',
        data: data.datasets[0].data,
        backgroundColor: ['#082ace', '#28ae60', '#FF5A2D'],
        borderWidth: '1',
        borderSkipped: false,
        borderRadius: '3',
        barPercentage: 1,
        categoryPercentage: 1,
      },
    ],
  };
  return (
    <div style={style}>
      <Bar options={options} data={dataFunnel} />
    </div>
  );
};

export default ChartFunnelWidget;
