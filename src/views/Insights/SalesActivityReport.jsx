import GenericTable from '../../components/GenericTable';

const SalesActivityReport = (results) => {
  const { data } = results[0];

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
          key: 'countOfTask',
          component: result['DealActivity.countOfTask'],
        },
        {
          key: 'countOfEvent',
          component: result['DealActivity.countOfEvent'],
        },
        {
          key: 'countOfCall',
          component: result['DealActivity.countOfCall'],
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
              key: 'countOfTask',
              component: 'Tasks',
            },
            {
              key: 'countOfEvent',
              component: 'Events',
            },
            {
              key: 'countOfCall',
              component: 'Calls',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default SalesActivityReport;
