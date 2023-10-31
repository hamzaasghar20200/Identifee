import { capitalize } from 'lodash';
import Avatar from '../../components/Avatar';
import GenericTable from '../../components/GenericTable';
import { formatQueryResult } from '../../components/analytics';

const SelfAssessment = (results) => {
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
          component: (
            <div className="d-flex align-items-center">
              <Avatar
                classModifiers="mr-2"
                user={{ avatar: result['User.avatar'] }}
              />
              {result['User.fullName']}
            </div>
          ),
        },
        {
          key: 'lastAttempted',
          component: formatQueryResult(
            'SelfAssessmentSubmission.updatedAt',
            result,
            annotation
          ),
        },
        {
          key: 'style',
          component: capitalize(
            result['SelfAssessmentSubmission.personalityType']
          ),
        },
        {
          key: 'similar',
          component: formatQueryResult(
            'SelfAssessmentSubmission.ratioOfMatchingPersonality',
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
              component: 'Name',
              width: '30%',
            },
            {
              key: 'lastAttempted',
              component: 'Last Attempted',
            },
            {
              key: 'style',
              component: 'Style',
            },
            {
              key: 'similar',
              component: 'Similar',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default SelfAssessment;
