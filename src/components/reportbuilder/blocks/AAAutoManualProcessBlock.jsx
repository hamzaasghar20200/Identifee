import { Col, Row } from 'react-bootstrap';
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import ReportDownloadWrapper from './ReportDownloadWrapper';
import MaterialIcon from '../../commons/MaterialIcon';

const ManualProcessIconSet = () => {
  return (
    <div
      className="position-absolute h-100 w-30"
      style={{ right: -15, top: -27 }}
    >
      <div>
        <div
          className="p-2 rounded position-absolute"
          style={{
            right: '120px',
            top: '48px',
            background: 'var(--secondaryColor)',
          }}
        >
          <MaterialIcon icon="price_check" clazz="text-white font-size-2xl" />
        </div>
        <div
          className="p-1 rounded position-absolute rpt-blue-box-lite"
          style={{
            right: '90px',
            top: '45px',
            width: 22,
            height: 22,
          }}
        >
          &nbsp;
        </div>
        <div
          className="p-1 rounded position-absolute rpt-blue-box-lite"
          style={{
            right: '170px',
            bottom: '15px',
            width: 22,
            height: 22,
          }}
        >
          &nbsp;
        </div>
        <div
          className="p-2 rounded position-absolute"
          style={{
            right: '120px',
            bottom: '-10px',
            background: '#FFFFFF',
          }}
        >
          <MaterialIcon icon="payments" clazz="text-gray-700 font-size-2xl" />
        </div>
        <div
          className="p-2 rounded position-absolute"
          style={{
            right: '68px',
            bottom: '17px',
            background: '#FFFFFF',
          }}
        >
          <MaterialIcon
            icon="attach_money"
            clazz="text-gray-700 font-size-2xl"
          />
        </div>
        <div
          className="p-1 rounded position-absolute rpt-blue-box-lite"
          style={{
            right: '90px',
            bottom: '-12px',
            width: 22,
            height: 22,
          }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
};

const AAAutoManualProcessBlock = ({ whenPrinting }) => {
  return (
    <ReportDownloadWrapper whenPrinting={whenPrinting}>
      <Card
        className={`position-relative overflow-hidden ${
          whenPrinting ? 'mb-5' : ''
        }`}
      >
        <CardBody className="rpt-blue-box py-4">
          <h4 className="text-left mb-1">Automating Manual Processes</h4>
          <Row className={`align-items-center mb-0`}>
            <Col className="justify-content-center">
              <p className="text-left font-size-sm2 mb-0">
                Best-in-class organizations streamline Accounts Payable and
                Accounts Receivable by integrating payments into their ERP,
                greatly reducing risk and manual data entry.
              </p>
            </Col>
            <Col md={4}>&nbsp;</Col>
          </Row>
        </CardBody>
        <ManualProcessIconSet />
      </Card>
    </ReportDownloadWrapper>
  );
};

export default AAAutoManualProcessBlock;
