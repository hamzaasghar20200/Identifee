import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const DealPipelineReport = (results) => {
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
          component: result['Deal.name'],
        },
        {
          key: 'stage',
          component: result['TenantDealStage.name'],
        },
        {
          key: 'close',
          component: formatQueryResult('Deal.dateClosed', result, annotation, {
            format: 'MM/DD/YYYY',
          }),
        },
        {
          key: 'amount',
          component: formatQueryResult('Deal.amount', result, annotation),
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
              component: 'Deal Name',
              width: '30%',
            },
            {
              key: 'stage',
              component: 'Stage',
            },
            {
              key: 'close',
              component: 'Expected Close Date',
            },
            {
              key: 'amount',
              component: 'Potential Revenue',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default DealPipelineReport;
