import React from 'react';
import { Card } from 'react-bootstrap';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { Col, Row } from 'reactstrap';

const CoreData = () => {
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
                <img src="/img/2.svg" className="w-100" />
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
            <Card className="shadow-none mb-0 border-0">
              <Card.Body className="p-0">
                <img src="/img/5.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={6} className="mt-3">
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Product Leads</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="p-0">
                <div>
                  <Row>
                    <Col md={6} className="mb-4">
                      <div className="product-lead-cards d-flex flex-column justify-content-between border border-gray-300 p-3 rounded-lg">
                        <h5>Commercial Card</h5>
                        <h2 className="mb-0">$367,839</h2>
                      </div>
                    </Col>
                    <Col md={6} className="mb-4">
                      <div className="product-lead-cards d-flex flex-column justify-content-between border border-gray-300 p-3 rounded-lg">
                        <h5>ACH</h5>
                        <h2 className="mb-0">$87,839</h2>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="product-lead-cards d-flex flex-column justify-content-between border border-gray-300 p-3 rounded-lg">
                        <h5>Fraud Services</h5>
                        <h2 className="mb-0">$36,783</h2>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="product-lead-cards d-flex flex-column justify-content-between border border-gray-300 p-3 rounded-lg">
                        <h5>AP Automation</h5>
                        <h2 className="mb-0">$267,839</h2>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CoreData;
