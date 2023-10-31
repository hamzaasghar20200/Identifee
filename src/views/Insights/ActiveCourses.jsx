import GenericTable from '../../components/GenericTable';
const LessonLeaderboard = (results) => {
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
          component: (
            <div className="d-flex text-wrap align-items-center">
              {result['Course.name']}
            </div>
          ),
        },
        {
          key: 'user',
          component: result['CourseProgress.uniqueCountOfUsers'],
        },
        {
          key: 'timeTaken',
          component: result['CourseProgress.count'],
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
              component: 'Name',
              width: '30%',
            },
            {
              key: 'user',
              component: 'Users',
            },
            {
              key: 'timeTaken',
              component: 'Times Taken',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default LessonLeaderboard;
