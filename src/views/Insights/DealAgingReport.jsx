import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const DealAgingReport = (results) => {
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
          key: 'age',
          component: formatQueryResult('Deal.age', result, annotation, {
            dateDiff: ['days'],
          }),
        },
        {
          key: 'amount',
          component: formatQueryResult('Deal.amount', result, annotation),
        },
        {
          key: 'assignedUser',
          component: formatQueryResult(
            'AssignedUser.fullName',
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
              component: 'Deal Name',
              width: '30%',
            },
            {
              key: 'age',
              component: 'Days Open',
            },
            {
              key: 'amount',
              component: 'Potential Revenue',
            },
            {
              key: 'assignedUser',
              component: 'User',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default DealAgingReport;
