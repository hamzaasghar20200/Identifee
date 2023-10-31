import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import { isToFixedNoRound, parseCurrency } from '../../../utils/Utils';
import MaterialIcon from '../../commons/MaterialIcon';
import GreenRedCheckItem from './GreenRedCheckItem';

const ExclaimationIcon = ({ style }) => {
  return (
    <div className="position-absolute" style={style}>
      <MaterialIcon
        icon="gpp_maybe"
        filled
        clazz="rpt-red-box-lite font-size-8em"
      />
    </div>
  );
};
const Riskier = ({ value }) => {
  return (
    <div className={`position-relative overflow-hidden rpt-red-box py-6`}>
      <div>
        <div
          className={`d-flex align-items-center mb-2 w-100 justify-content-center gap-2`}
        >
          <ExclaimationIcon style={{ right: -30, top: -30 }} />
          <ExclaimationIcon style={{ left: -30, bottom: -30 }} />
          <div className="icon-wrap-red d-flex align-items-center justify-content-center">
            <MaterialIcon
              icon="attach_money"
              clazz="icon-money-red font-size-xl p-1_2 text-white"
            />
          </div>
          <h1 className={`font-size-2p5em fw-bolder mb-0`}>
            {isToFixedNoRound(parseCurrency(value))}
          </h1>
        </div>
        <p
          className="fs-9 mb-0 mx-auto text-center font-weight-normal"
          style={{ maxWidth: 300 }}
        >
          balances at risk
        </p>
      </div>
    </div>
  );
};
const GreatJob = ({ value }) => {
  return (
    <div className={`position-relative rpt-green-box py-6`}>
      <div>
        <div
          className={`d-flex align-items-center mb-2 justify-content-center gap-2`}
        >
          <div className="icon-wrap d-flex align-items-center justify-content-center">
            <MaterialIcon
              icon="attach_money"
              clazz="icon-money font-size-xl p-1_2 text-white"
            />
          </div>
          <h1 className={`font-size-2p5em fw-bolder mb-0`}>
            {isToFixedNoRound(parseCurrency(value))}
          </h1>
        </div>
        <p
          className="fs-9 mb-0 mx-auto text-black text-center font-weight-normal"
          style={{ maxWidth: 300 }}
        >
          You&apos;re doing a great job protecting your balances.
        </p>
      </div>
    </div>
  );
};

const AAPaymentRisksBlock = ({
  report,
  whenPrinting,
  ignoreHeadings,
  editCallback,
  excelBankMode,
}) => {
  const paymentRisks = report?.paymentRisks || {};
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className="mb-2">
        <CardBody className="pb-2">
          {!ignoreHeadings && (
            <>
              <h5 className={`text-left mb-2`}>Payment Risks</h5>
            </>
          )}
          <Row className={`align-items-center position-relative mb-0`}>
            <Col md={12}>
              <div className="text-center">
                {paymentRisks?.balance?.isChecked ? (
                  <GreatJob value={report.value7} />
                ) : (
                  <Riskier value={report.value7} />
                )}
              </div>
              <p className="font-size-sm2 font-weight-semi-bold text-left mb-0 mt-2">
                Fraud Prevention Product
              </p>
              <div className="d-flex position-relative justify-content-center py-1 fraud-products align-items-center">
                {Object.entries(
                  paymentRisks?.fraudPreventionProducts || {}
                ).map((entry) => (
                  <div
                    key={entry[0]}
                    className="text-center flex-fill d-flex align-items-center justify-content-center"
                  >
                    <GreenRedCheckItem bordered="" item={entry} />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default AAPaymentRisksBlock;
