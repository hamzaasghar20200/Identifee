import BaseBlock from './BaseBlock';
import React, { useEffect, useState } from 'react';
import IdfDropdown from '../../idfComponents/idfDropdown';
import BlockDescription from './BlockDescription';
import { Doughnut } from 'react-chartjs-2';

const Ranges = [
  { label: 'Up to $2,500', label2: 'or up to $2,500', value: '<2500' },
  {
    label: '$2,500 - $10,000',
    label2: '$2,500 - $10,000',
    value: '2500-10000',
  },
  {
    label: '$10,000 - $100,000',
    label2: '$10,000 - $100,000',
    value: '10000-100000',
  },
  { label: 'Over $100,000', label2: 'or over $100,000', value: '>100000' },
];

const RPMGDonut = ({ chartData, percentage }) => {
  return (
    <div className="position-relative" style={{ height: 130 }}>
      {chartData.datasets[0].data?.length > 0 && (
        <>
          <Doughnut options={circleConfig.options} data={chartData} />
          <p
            className="position-absolute font-size-xl2 font-weight-bold"
            style={{
              left: '50%',
              transform: 'translate(-50%, -20%)',
              top: '30%',
              color: percentage?.color,
            }}
          >
            {percentage?.value}%
          </p>
        </>
      )}
    </div>
  );
};

const chartColors = ['#c1232a', '#eee'];

const circleConfig = {
  type: 'pie',
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 1,
        backgroundColor: chartColors,
        borderColor: chartColors,
        hoverBorderColor: '#fff',
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: 35,
    plugins: {
      datalabels: { display: false },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
        },
      },
      tooltip: {
        usePointStyle: true,
        enabled: false, // disabling it for now
      },
    },
  },
};

const RPMGBlock = ({
  partner,
  showAdd,
  showRange = true,
  direction = '',
  description,
  transactionSummary,
  handleChangeRange,
  block,
}) => {
  const [transactionRange, setTransactionRange] = useState(Ranges[0]);
  const [newDescription, setNewDescription] = useState(description);
  const [percentage, setPercentage] = useState({ value: 'X' });
  const [chartData, setChartData] = useState({ ...circleConfig.data });

  const refreshChart = () => {
    // get data from map by passing selected range value
    const defaultValue = transactionSummary?.defaultRange
      ? { value: transactionSummary?.defaultRange }
      : transactionRange;
    const dataArray = transactionSummary?.chartDataMap[defaultValue.value];
    if (dataArray?.length) {
      setPercentage({
        value: dataArray[0],
        color: dataArray && chartColors[0],
      });

      // once range is changed update description text too, the following function is passed from parent component where all replace logic is placed.
      setNewDescription(
        transactionSummary.updateDescription(
          dataArray,
          transactionRange.label2
        )[0]
      );

      const newData = [
        {
          ...chartData.datasets,
          data: dataArray,
          backgroundColor: chartColors,
          borderColor: chartColors,
          hoverBorderColor: '#fff',
        },
      ];
      setChartData({
        ...chartData,
        labels: transactionSummary.labels,
        datasets: newData,
      });
    }
  };

  useEffect(() => {
    refreshChart();
  }, [transactionRange, transactionSummary]);

  const handleAdd = () => {
    showAdd(block, transactionRange, chartData, newDescription);
  };
  return (
    <BaseBlock
      showAdd={typeof showAdd === 'function' ? handleAdd : showAdd}
      partner={partner}
      direction={direction}
      dataBlock={<RPMGDonut chartData={chartData} percentage={percentage} />}
      textBlock={
        <>
          {showRange && (
            <div className="d-flex pb-3 align-items-center">
              <h5 className="mb-0">Range</h5>
              <IdfDropdown
                className="ml-2"
                variant={'white'}
                items={Ranges}
                onChange={(item) => {
                  setTransactionRange(item);
                  handleChangeRange(block, item);
                }}
                defaultValue={transactionRange}
              />
            </div>
          )}
          {newDescription || (
            <BlockDescription
              texts={[
                `On average, your peers pay (${
                  percentage?.value
                }%) of all payables between ${
                  transactionRange?.label || 'X'
                } by commercial card, providing a substantial increase in Days Payables.`,
                'Peers are leveraging commercial card to improve Working Capital.',
              ]}
            />
          )}
        </>
      }
    />
  );
};

export default RPMGBlock;
