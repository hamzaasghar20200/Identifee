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
          key: 'lessons',
          component: (
            <div className="d-flex text-wrap align-items-center">
              {result['Lesson.title']}
            </div>
          ),
        },
        {
          key: 'totalAttemps',
          component: result['LessonProgress.count'],
        },
        {
          key: 'averageCompletion',
          component: result['LessonProgress.avgLessonCompletedByUser'] + '%',
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
              key: 'courses',
              component: 'Lessons',
              width: '30%',
            },
            {
              key: 'totalAttemps',
              component: 'Total Attempts',
            },
            {
              key: 'averageCompletion',
              component: 'Completed %',
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
