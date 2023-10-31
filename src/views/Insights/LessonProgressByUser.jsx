import GenericTable from '../../components/GenericTable';
import { setDateFormat } from '../../utils/Utils';
const LessonProgressReport = (results) => {
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
              {result['Lesson.title']}
            </div>
          ),
        },
        {
          key: 'timesTaken',
          component: result['LessonProgress.count'],
        },
        {
          key: 'completed',
          component:
            result['LessonProgress.countOfCompleted'] > 0 ? 'Yes' : 'No',
        },
        {
          key: 'lastAttempted',
          component: setDateFormat(
            result['LessonProgress.maxOfLastAttempt'],
            'MM/DD/YYYY'
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
              component: 'Lesson',
            },
            {
              key: 'timesTaken',
              component: 'Times Taken',
            },
            {
              key: 'completed',
              component: 'Completed',
            },
            {
              key: 'lastAttempted',
              component: 'Last Attempted',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default LessonProgressReport;
