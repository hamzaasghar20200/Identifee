import React, { useEffect, useState } from 'react';
import { Row, Col, CardBody, CardFooter, Card } from 'reactstrap';
import Heading from './heading';
import NoDataFound from './commons/NoDataFound';
import Loading from './Loading';
import MaterialIcon from './commons/MaterialIcon';
import { Link, useLocation } from 'react-router-dom';
import routes from '../utils/routes.json';
import { decimalToNumber } from '../utils/Utils';
import { ProgressBarDefault } from './commons/Progress';
import courseService from '../services/course.service';

const LabelColors = {
  Advanced: { bgColor: '#F9F5FF', foreColor: '#7F56D9' },
  Foundational: { bgColor: '#ECFDF3', foreColor: '#039855' },
  Elective: { bgColor: '#FFFAEB', foreColor: '#DC6803' },
  Essentials: { bgColor: '#FFF6ED', foreColor: '#EC4A0A' },
};
const Labels = ({ item, labels }) => {
  const label = labels?.length > 0 ? labels[0]?.trim() : '';
  const colorStyle = (label && LabelColors[label]) || {
    bgColor: '#ECFDF3',
    foreColor: '#039855',
  };

  return (
    <div className="d-flex align-items-center mt-2 flex-wrap gap-1">
      {(item?.progress === 100 || item?.progress[0]?.progress === 100) && (
        <span
          style={{
            minWidth: 80,
          }}
          className="bg-soft-dark text-gray-700 rounded-pill fs-9 py-1 labels text-center font-weight-500"
        >
          <MaterialIcon
            icon="done"
            style={{
              padding: '2px',
            }}
            clazz="text-white bg-gray-700 fs-8 rounded-circle"
          />{' '}
          Watched
        </span>
      )}
      <span
        style={{
          minWidth: 80,
          color: colorStyle?.foreColor,
          background: colorStyle?.bgColor,
        }}
        className="rounded-pill fs-9 py-1 labels px-3 text-center font-weight-medium"
      >
        {LabelColors[label] ? label : 'Foundational'}
      </span>
    </div>
  );
};
export const LessonLayout = (props) => {
  const location = useLocation();
  const { children, lesson, loading, relatedLessons, course } = props;
  const [progress, setProgress] = useState({});
  const getProgress = async () => {
    const progress = await courseService
      .getCourseProgress(course, { self: true })
      .catch(() => {});
    setProgress(progress?.progress);
  };
  useEffect(() => {
    getProgress();
  }, [course, location]);
  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <Row className="mb-5">
        <Col md={8} className="pr-1">
          {children}
        </Col>
        <Col md={4} className={`${lesson?.progress ? 'mt-3' : 'pt-3 mt-4'}`}>
          {course ? (
            <Card className="rounded-lg">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <h4 className="fs-6">Course Progress</h4>
                  <p className="fs-7 text-muted">
                    {decimalToNumber(progress)}% Completed
                  </p>
                </div>
                <ProgressBarDefault
                  now={decimalToNumber(progress)}
                  label={'course'}
                  variant={parseInt(progress) === 100 ? 'success' : null}
                />
              </CardBody>
            </Card>
          ) : (
            <Heading
              title={'Recommended Lessons'}
              pageHeaderDivider="pb-0 mb-0"
            />
          )}

          {relatedLessons?.length === 0 ? (
            <NoDataFound title="No Recommended Lessons Found" />
          ) : (
            relatedLessons?.map((item) => {
              const parsedTags = item?.tags?.length && JSON.parse(item.tags);
              const date = new Date(item?.created_at);
              const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              };
              const formattedDate = date.toLocaleDateString(undefined, options);
              return (
                <Link
                  to={
                    item?.category_id
                      ? `${routes.learnLessons}/${item?.id}`
                      : `${routes.courses}/${item?.id}`
                  }
                  key={item}
                >
                  <div className="mt-3">
                    <div className="mt-3 cursor-pointer">
                      <Card
                        className={`setting-item lesson-card-box rounded-lg ${
                          lesson?.id === item?.id ? 'lesson-active' : ''
                        }`}
                      >
                        <CardBody className="p-2_1 px-3 overflow-y-auto h-100">
                          <div className="d-flex flex-column h-100">
                            <div className="d-flex align-items-center flex-fill">
                              <div className={`flex-fill mb-2`}>
                                <div className="text-right">
                                  <Labels item={item} labels={parsedTags} />
                                </div>
                                <span className="text-primary pt-4 font-size-md font-weight-500 d-block">
                                  {item?.category_id ? 'Lesson' : 'Course'}
                                </span>
                                <h4 className="card-title mb-0 text-hover-primary text-wrap">
                                  {item.title || item.name}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                        <CardFooter className="p-2_1 px-3">
                          <Row className="justify-content-between align-items-center">
                            <Col className="col-auto d-flex flex-row align-items-center">
                              <div className="pl-2">
                                <MaterialIcon
                                  icon="access_time_filled"
                                  clazz="text-gray-500"
                                />{' '}
                                <span className="text-gray-500 pl-1">
                                  {formattedDate}
                                </span>
                              </div>
                            </Col>
                            <div className="col-auto text-muted fs-6">
                              {item.duration > 0 && `~${item.duration} mins`}
                            </div>
                          </Row>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </Col>
      </Row>
    </div>
  );
};
