import React from 'react';
import { Card } from 'react-bootstrap';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { Col, Row } from 'reactstrap';

const CoreDataV2 = () => {
  return (
    <>
      <Row className="h-100">
        <Col md={6}>
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Deposit Summary</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="p-0">
                <img src="/img/1.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={6}>
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Deposit Change</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="p-0">
                <img src="/img/3.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={6} className="mt-3">
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Open vs Closed Accounts</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="p-0">
                <img src="/img/6.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={6} className="mt-3">
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Deposit Breakdown </h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="px-0 pb-0 text-center">
                <img src="/img/7.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CoreDataV2;
