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
          component: (
            <div className="d-flex text-wrap align-items-center">
              {result['Course.name']}
            </div>
          ),
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
          key: 'lastAttempted',
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
              component: 'Course',
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

export default CourseProgressReport;
