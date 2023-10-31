import React, { useEffect, useState } from 'react';

import ManagementCourses from '../../Resources/courses/ManageCourses';
import ListCourses from '../../Resources/courses/ListCourses';

const CoursesView = () => {
  const [create, setCreate] = useState(false);
  const [id, setId] = useState();

  useEffect(() => {
    if (!create) {
      setId(null);
    }
  }, [create]);
  return (
    <>
      {create ? (
        <ManagementCourses currentCourseId={id} setCreate={setCreate} />
      ) : (
        <ListCourses setCreate={setCreate} setId={setId} />
      )}
    </>
  );
};

export default CoursesView;
