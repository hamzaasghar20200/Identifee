import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const DealsProgressReport = (results) => {
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
          key: 'activityName',
          component: formatQueryResult(
            'NextDealActivity.name',
            result,
            annotation
          ),
        },
        {
          key: 'dateModified',
          component: formatQueryResult(
            'Deal.dateModified',
            result,
            annotation,
            {
              format: 'MM/DD/YYYY',
            }
          ),
        },
        {
          key: 'modifiedBy',
          component: formatQueryResult(
            'UpdatedBy.fullName',
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
              key: 'stage',
              component: 'Stage',
            },
            {
              key: 'activityName',
              component: 'Next Activity',
            },
            {
              key: 'dateModified',
              component: 'Last Updated',
            },
            {
              key: 'modifiedBy',
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

export default DealsProgressReport;
