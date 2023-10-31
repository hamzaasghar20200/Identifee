import { Card, CardBody } from 'reactstrap';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FraudMitigationQrCode from '../../../assets/svg/fraud-mitigation.png';

const FraudMitigationBlock = ({ whenPrinting }) => {
  return (
    <div className={`${whenPrinting ? 'px-5' : 'px-3'}`}>
      <Card className="mb-2">
        <CardBody className="bg-primary-soft">
          <h5 className="text-left d-flex justify-content-between mb-1 d-flex align-items-center gap-1">
            Fraud Mitigation
          </h5>
          <Row className={`align-items-center mb-0`}>
            <Col className="justify-content-center">
              <p
                className={`${
                  whenPrinting ? 'fs-9' : 'font-size-sm2'
                } text-left`}
              >
                Fraud results in a 5% annual revenue loss for businesses,
                amounting to over <b>$4.5</b> trillion globally. Fraud
                Mitigation tools provide a vital defense to revenue loss,
                allowing businesses to protect their bottom line, foster trust,
                and effectively combat fraudulent schemes.
              </p>
              <p
                className={`text-muted text-left mb-0 ${
                  whenPrinting ? 'fs-10' : 'fs-9'
                }`}
              >
                Nasdaq.com (2022, February). Companies Are Losing Billions to
                External Fraud, and Shareholders Are Paying a Price.
                Nasdaq.com.&nbsp;
              </p>
            </Col>
            <Col md={3}>
              <div
                style={{ height: 115, width: 115 }}
                className="bg-white justify-content-center gap-2 d-flex align-items-center flex-column p-2 rounded-lg text-center"
              >
                <img
                  alt="Fraud mitigation url"
                  src={FraudMitigationQrCode}
                  width={100}
                  height={100}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default FraudMitigationBlock;
