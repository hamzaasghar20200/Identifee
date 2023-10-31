import { Col, Row } from 'react-bootstrap';
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import Skeleton from 'react-loading-skeleton';

const ManualProcessIconSet = () => {
  return (
    <div
      className="position-absolute h-100 w-30"
      style={{ right: -15, top: -27 }}
    >
      <div
        className="p-2 rounded d-flex align-items-center position-absolute"
        style={{
          right: '120px',
          top: '67px',
          background: '#FFF',
        }}
      >
        <MaterialIcon
          icon="request_quote"
          filled
          clazz="text-gray-700 font-size-2xl"
        />
      </div>
      <div
        className="p-1 rounded position-absolute rpt-blue-box-lite"
        style={{
          right: '90px',
          top: '65px',
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
        className="p-2 rounded d-flex align-items-center position-absolute"
        style={{
          right: '120px',
          bottom: '15px',
          background: 'var(--secondaryColor)',
        }}
      >
        <MaterialIcon
          icon="account_balance_wallet"
          filled
          clazz="text-white font-size-2xl"
        />
      </div>
      <div
        className="p-2 rounded position-absolute"
        style={{
          right: '68px',
          bottom: '37px',
          background: '#FFFFFF',
        }}
      >
        <MaterialIcon
          icon="account_balance"
          clazz="text-gray-700 font-size-2xl"
        />
      </div>
      <div
        className="p-1 rounded position-absolute rpt-blue-box-lite"
        style={{
          right: '90px',
          bottom: '7px',
          width: 22,
          height: 22,
        }}
      >
        &nbsp;
      </div>
    </div>
  );
};

const AAReceivablesPaymentBreakdownBlock = ({
  report,
  setReport,
  insightsData,
  whenPrinting,
  ignoreHeadings,
  loader,
  isManual,
}) => {
  const avgDSO = !report?.valueN?.length ? 0 : insightsData?.sp?.days_sales_out;
  const bestInClassDSO = !report?.valueN?.length
    ? 0
    : insightsData?.sp?.aggregations?.find(
        (agr) => agr.aggregation_type === 'AVERAGE_BOTTOM_10_PERCENT'
      )?.days_sales_out || 0;
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className={`mb-2 ${!whenPrinting && ignoreHeadings ? 'mt-2' : ''}`}>
        <CardBody className="pb-2">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className={`mb-0`}>Days Sales Outstanding</h5>
            <span className="fs-9 text-muted font-weight-normal">
              Source: S&P Global
            </span>
          </div>

          <div className="d-flex align-items-center justify-content-center mt-2">
            <div className="position-relative" style={{ top: 3, left: -5 }}>
              <img src="/img/Vector%204.png" className="w-100" />
              <div className="position-absolute w-100 abs-center-xy">
                <div className="d-flex align-items-center justify-content-center gap-1">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>
                      <h1 className="mb-0 rpt-red-box-heading font-weight-bold">
                        {avgDSO}
                      </h1>
                      <h1 className="mb-0 rpt-red-box-heading font-weight-bold">
                        Days
                      </h1>
                    </>
                  )}
                </div>
                <p className="fs-10 mb-1 w-65 m-auto font-weight-medium">
                  Days Sales Outstanding Industry Average
                </p>
              </div>
            </div>
            <div className="position-relative" style={{ left: -5 }}>
              <img src="/img/Vector%208.png" className="w-100" />
              <div className="position-absolute abs-center-xy">
                <MaterialIcon icon="credit_score" clazz="font-size-2xl" />
                <p className="fs-10 mb-0 font-weight-medium">
                  Electronic Invoicing and Receivables
                </p>
              </div>
            </div>
            <div className="position-relative">
              <img src="/img/Vector%206.png" className="w-100" />
              <div className="position-absolute w-100 abs-center-xy">
                <div className="d-flex align-items-center justify-content-center gap-1">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>
                      <h1 className="mb-0 rpt-green-box-heading font-weight-bold">
                        {bestInClassDSO}
                      </h1>
                      <h1 className="mb-0 rpt-green-box-heading font-weight-bold">
                        Days
                      </h1>
                    </>
                  )}
                </div>
                <p className="fs-10 mb-1 font-weight-medium w-75 m-auto">
                  Days Sales Outstanding Industry Best-In-Class
                </p>
              </div>
            </div>
          </div>

          <div className="border-top pt-2 mt-2">
            <p className="fs-8 text-muted text-left mb-0 ">
              Automating reconciliation and accepting merchant card payments can
              expedite fund receipt and enhance your days sales outstanding.
            </p>
          </div>
        </CardBody>
      </Card>
      <Card className={`position-relative overflow-hidden mb-2`}>
        <CardBody className="rpt-blue-box py-4">
          <h5 className="text-left mb-1">Days Sales Outstanding (DSO)</h5>
          <Row className={`align-items-center mb-0`}>
            <Col className="justify-content-center">
              <p className="text-left font-size-sm2 mb-0">
                Accelerate Cash Flow with Expanded Payment Methods. To enhance
                your working capital and streamline receivables collections,
                consider expanding your payment methods. Offering customers a
                variety of payment options can significantly reduce your Days
                Sales Outstanding (DSO) and optimize your working capital cycle.
              </p>
            </Col>
            <Col md={3}>&nbsp;</Col>
          </Row>
        </CardBody>
        <ManualProcessIconSet />
      </Card>
      {whenPrinting && (
        <>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default AAReceivablesPaymentBreakdownBlock;
