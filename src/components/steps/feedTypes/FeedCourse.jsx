import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../utils/routes.json';

const FeedCourse = ({ data }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="mr-2">
          <Link to={`${routes.courses}/${data?.id}`}>
            <h4>{data?.name}</h4>
          </Link>
          <p className="d-gray">
            {data?.required_modules && `${data.required_modules} Lessons`}
          </p>
        </div>
      </div>
    </div>
  );
};

FeedCourse.defaultProps = {
  data: {},
};

export default FeedCourse;
