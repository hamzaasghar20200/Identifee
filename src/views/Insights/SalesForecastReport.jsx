import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const SalesForecastReport = (results) => {
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
          key: 'sumOfPendingRevenue',
          component: formatQueryResult(
            'Deal.sumOfPendingRevenue',
            result,
            annotation
          ),
        },
        {
          key: 'count',
          component: result['Deal.count'],
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
              key: 'sumOfPendingRevenue',
              component: 'Expected Revenue',
            },
            {
              key: 'count',
              component: 'Number of Deals',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default SalesForecastReport;
