import React from 'react';
import { Card } from 'react-bootstrap';
import { CardBody } from 'reactstrap';
import TopicIcon from '../commons/TopicIcon';

export const LearnCard = ({ data, onClick }) => {
  return (
    <Card
      className="rounded h-100 setting-item cursor-pointer"
      onClick={onClick}
    >
      <CardBody className="h-100">
        <div className="h-100">
          <div className="d-flex align-items-center justify-content-between h-100 flex-column">
            <div className="text-center">
              <TopicIcon
                icon={data.icon}
                iconBg="bg-primary-soft"
                iconStyle={{ width: 95, height: 95, margin: '0 auto' }}
                iconClasses="font-size-4em text-primary"
              />
            </div>
            <div className="text-left w-100">
              <h6 className="mb-0 mt-5 text-muted font-weight-500">
                {data?.type}
              </h6>
              <h4 className="mb-0">{data.name}</h4>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
