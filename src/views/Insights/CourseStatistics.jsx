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
          key: 'courses',
          component: (
            <div className="d-flex text-wrap align-items-center">
              {result['Course.name']}
            </div>
          ),
        },
        {
          key: 'totalAttemps',
          component: result['CourseProgress.count'],
        },
        {
          key: 'averageCompletion',
          component: result['CourseProgress.avgCoursesCompletedByUser'] + '%',
        },
        {
          key: 'lessons',
          component: result['CourseProgress.uniqueCountOfLessons'],
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
              component: 'Courses',
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
            {
              key: 'lessons',
              component: 'Lessons Included',
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
