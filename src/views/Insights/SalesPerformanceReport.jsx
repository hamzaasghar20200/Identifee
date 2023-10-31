import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const SalesPerformanceReport = (results) => {
  const { data, annotation } = results[0];

  const rows = data.map((result, index) => {
    const rank = index + 1;

    return {
      id: index,
      dataRow: [
        {
          key: 'rank',
          component: (
            <div className="rank-container">
              <span className={`rank-${rank}`}>{rank}</span>
            </div>
          ),
        },
        {
          key: 'name',
          component: result['CreatedBy.fullName'],
        },
        {
          key: 'countOfClosed',
          component: formatQueryResult(
            'Deal.countOfClosed',
            result,
            annotation
          ),
        },
        {
          key: 'sumOfRevenue',
          component: formatQueryResult('Deal.sumOfRevenue', result, annotation),
        },
        {
          key: 'avgWon',
          component: formatQueryResult('Deal.avgWon', result, annotation),
        },
      ],
    };
  });

  return (
    <div>
      <div>
        <GenericTable
          checkbox={false}
          data={rows}
          columns={[
            {
              key: 'rank',
              component: 'Rank',
              width: '5%',
            },
            {
              key: 'name',
              component: 'User',
              width: '30%',
            },
            {
              key: 'countOfClosed',
              component: 'Deals Closed',
            },
            {
              key: 'sumOfRevenue',
              component: 'Revenue Generated',
            },
            {
              key: 'avgWon',
              component: 'Conversion Rate',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default SalesPerformanceReport;
