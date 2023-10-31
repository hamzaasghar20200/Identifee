import SubHeading from '../../components/subheading';
import CardSkeleton from '../../components/lesson/CardSkeleton';
import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import StatsAndFilter from '../../components/lesson/StatsAndFilter';
import TopicIcon from '../../components/commons/TopicIcon';
import { sortByPinnedTopics } from '../../utils/Utils';
const myOrganization = {
  icon: 'corporate_fare',
  title: 'My Organization',
};
const TopicItem = ({ topic }) => {
  return (
    <Link to={topic.path}>
      <Card className="h-100 p-0 setting-item">
        <CardBody className="py-0 position-relative pr-4 pl-0 h-100">
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ height: 250 }}
          >
            <h3 className="text-left p-2_1 px-3" style={{ marginTop: -90 }}>
              {topic.title}
            </h3>
            <TopicIcon
              icon={topic.icon || 'category'}
              iconBg="bg-primary-soft"
              iconStyle={{ width: 96, height: 96 }}
              iconClasses="font-size-4em text-primary"
            />
          </div>
          <p className="position-absolute text-muted fs-8 px-3 py-2 bottom-0 left-0 mb-0">
            <StatsAndFilter
              showStatsOnly={true}
              courseKey="totalCourses"
              lessonKey="totalLessons"
              categoryInfo={topic}
              stats={topic}
            />
          </p>
        </CardBody>
      </Card>
    </Link>
  );
};

const TopicItems = ({
  topics,
  heading,
  updateFilterList,
  setSelectedFilter,
}) => {
  const history = useHistory();

  return (
    <div className="px-2">
      <SubHeading title={heading} />
      <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3">
        {sortByPinnedTopics(topics)?.map((cat, indx) => (
          <>
            <Col className={`mb-2 px-2 ${indx === 0 ? 'd-block' : 'd-none'}`}>
              <Card
                className="h-100 p-0 setting-item"
                onClick={() => {
                  history.replace({
                    search: `?viewType=${updateFilterList[2].key}`,
                  });
                  setSelectedFilter(updateFilterList[2]);
                }}
              >
                <CardBody className="py-0 position-relative pr-4 pl-0 h-100">
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ height: 250 }}
                  >
                    <h3
                      className="text-left p-2_1 px-3"
                      style={{ marginTop: -90 }}
                    >
                      {myOrganization.title}
                    </h3>
                    <TopicIcon
                      icon={myOrganization.icon || 'category'}
                      iconBg="bg-primary-soft"
                      iconStyle={{ width: 96, height: 96 }}
                      iconClasses="font-size-4em text-primary"
                    />
                  </div>
                </CardBody>
              </Card>{' '}
            </Col>
            <Col key={indx} className="mb-2 px-2">
              <TopicItem topic={cat} />
            </Col>
          </>
        ))}
      </Row>
    </div>
  );
};

const Topics = ({ loading, topics, updateFilterList, setSelectedFilter }) => {
  return (
    <div>
      {loading && (
        <div className="px-2">
          <div>
            <SubHeading title={'Topics'} />{' '}
            <CardSkeleton count={3} cols="row-cols-md-3" />
          </div>
          <div>
            <SubHeading title={'Custom'} />{' '}
            <CardSkeleton count={3} cols="row-cols-md-3" />
          </div>
        </div>
      )}
      {topics?.exploreList?.length > 0 && (
        <TopicItems
          updateFilterList={updateFilterList}
          setSelectedFilter={setSelectedFilter}
          topics={topics?.exploreList}
          heading="Categories"
        />
      )}
    </div>
  );
};

export default Topics;
