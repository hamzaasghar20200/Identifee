import SubHeading from '../../components/subheading';
import CardSkeleton from '../../components/lesson/CardSkeleton';
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import StatsAndFilter from '../../components/lesson/StatsAndFilter';
import TopicIcon from '../../components/commons/TopicIcon';
import { sortByPinnedTopics } from '../../utils/Utils';
import categoryService from '../../services/category.service';

const TopicItem = ({ topic }) => {
  console.log(topic);
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

const TopicItems = ({ topics, heading }) => {
  return (
    <div className="px-2">
      <SubHeading title={heading} />
      <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3">
        {sortByPinnedTopics(topics)?.map((cat, indx) => (
          <Col key={indx} className="mb-2 px-2">
            <TopicItem topic={cat} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const mapCategoryPath = (item) => {
  const path = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
  return {
    ...item,
    path: `/learn?id=${item.id}&viewType=${
      item?.isPublic ? 'explore' : 'custom'
    }&path=${path}&title=${item.title}&type=${
      item.isPublic ? 'explore' : 'custom'
    }`,
  };
};

const OrganizationTopics = () => {
  const [customList, setCustomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getCategories = async () => {
    try {
      setLoading(true);
      const requests = await categoryService.GetCategories(null, {
        limit: 75,
        restrictBy: 'private',
      });
      const customList = requests.data?.map((m) => ({
        ...m,
        restrictBy: 'private',
      }));
      setCustomList(customList.map(mapCategoryPath));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div>
      {loading && (
        <div className="px-2">
          <div>
            <SubHeading title={'My Organization'} />{' '}
            <CardSkeleton count={3} cols="row-cols-md-3" />
          </div>
          <div>
            <SubHeading title={'Custom'} />{' '}
            <CardSkeleton count={3} cols="row-cols-md-3" />
          </div>
        </div>
      )}
      {customList?.length > 0 && (
        <TopicItems topics={customList} heading="My Organization" />
      )}
    </div>
  );
};

export default OrganizationTopics;
