import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const SalesFunnelReport = (results) => {
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
          component: result['TenantDealStage.name'],
        },
        {
          key: 'count',
          component: result['Deal.count'],
        },
        {
          key: 'avgWon',
          component: formatQueryResult('Deal.avgWon', result, annotation),
        },
        {
          key: 'sumOfPendingRevenue',
          component: formatQueryResult(
            'Deal.sumOfPendingRevenue',
            result,
            annotation
          ),
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
              component: 'Stage',
              width: '30%',
            },
            {
              key: 'count',
              component: 'Number of Deals',
            },
            {
              key: 'avgWon',
              component: 'Conversion Rate',
            },
            {
              key: 'sumOfPendingRevenue',
              component: 'Expected Revenue',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default SalesFunnelReport;
