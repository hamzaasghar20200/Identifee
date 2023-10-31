import Skeleton from 'react-loading-skeleton';
import { Card, CardBody, Col, Row } from 'reactstrap';
import React from 'react';

const ReportBlocksSkeleton = () => {
  return (
    <div className="p-3">
      <br />
      <div className="text-left">
        <Skeleton height={12} width={300} className="mb-1" />
        <Card className="mb-3">
          <CardBody>
            <div className="text-center">
              <div>
                <Skeleton width={300} height={10} />
              </div>
              <p>
                <Skeleton width={100} height={10} />
              </p>
              <Skeleton width="100%" height={10} count={3} />
            </div>
          </CardBody>
        </Card>
      </div>
      <br />
      <br />
      <div className="text-left">
        <Skeleton height={12} width={300} className="mb-1" />
        <Card>
          <CardBody>
            <Row className={`align-items-center position-relative py-2 mb-2`}>
              <Col className="justify-content-center">
                <Skeleton width="100%" height={10} count={3} />
              </Col>
              <Col md={3} className="position-relative">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <p className="mb-0" style={{ height: 100, width: 100 }}>
                    <Skeleton circle width={90} height={90} />{' '}
                  </p>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReportBlocksSkeleton;
