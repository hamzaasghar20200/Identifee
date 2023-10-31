import Avatar from '../../components/Avatar';
import GenericTable from '../../components/GenericTable';
import { roundDecimalToNumber, setDateFormat } from '../../utils/Utils';

const LessonLeaderboard = (results) => {
  const { data } = results[0];

  const rows = data.map((result, index) => {
    const user = {
      firstName: result['User.firstName'],
      lastName: result['User.lastName'],
      avatar: result['User.avatar'],
    };
    const name = `${result['User.firstName']} ${result['User.lastName']}`;
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
            <div className="d-flex align-items-center">
              <Avatar classModifiers="mr-2" user={user} />
              {name}
            </div>
          ),
        },
        {
          key: 'completed',
          component: result['Training.completeCourses'],
        },
        {
          key: 'avgOfAttemps',
          component: roundDecimalToNumber(result['Training.avgCourseAttempt']),
        },
        {
          key: 'lastAttempted',
          component: setDateFormat(
            result['Training.maxCourseLastAttempt'],
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
              component: 'Name',
              width: '30%',
            },
            {
              key: 'completed',
              component: 'Completed Courses',
            },
            {
              key: 'avgOfAttemps',
              component: 'Average Retake',
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

export default LessonLeaderboard;
