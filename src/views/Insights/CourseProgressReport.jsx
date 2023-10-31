import GenericTable from '../../components/GenericTable';
import { setDateFormat, roundDecimalToNumber } from '../../utils/Utils';

const CourseProgressReport = (results) => {
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
          component: result['User.fullName'],
        },
        {
          key: 'timesTaken',
          component: result['CourseProgress.count'],
        },
        {
          key: 'progress',
          component:
            roundDecimalToNumber(result['CourseProgress.avgOfProgress']) + '%',
        },
        {
          key: 'Last Attempted',
          component: setDateFormat(
            result['CourseProgress.maxOfLastAttempt'],
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
              component: 'User',
            },
            {
              key: 'timesTaken',
              component: 'Times Taken',
            },
            {
              key: 'progress',
              component: 'Progress',
            },
            {
              key: 'Last Attempted',
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

export default CourseProgressReport;
