import React from 'react';
import { LearnCard } from './LearnCard';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const CategoryData = [
  {
    icon: 'corporate_fare',
    name: 'My Organization',
    path: '/learn/my-organization',
    type: 'Category',
  },
  {
    icon: 'all_inbox',
    name: 'Sales Strategy & Skills',
    path: '/learn/my-organization',
    type: 'Category',
  },
  {
    icon: 'accessible_forward',
    name: 'Products & Services',
    path: '/learn/my-organization',
    type: 'Category',
  },
  {
    icon: 'category',
    name: 'Working Capital & Insights',
    path: '/learn/working-capital',
    type: 'Category',
  },
];

export const LearnCategories = () => {
  return (
    <>
      <Row className="px-2">
        {CategoryData?.map((item) => (
          <Col key={item} className="px-2 cursor-pointer">
            <Link to={item?.path}>
              <LearnCard data={item} />
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
};
