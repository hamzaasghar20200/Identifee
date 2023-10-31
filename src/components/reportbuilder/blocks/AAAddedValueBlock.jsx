import { Col, Row } from 'react-bootstrap';
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import {
  isToFixedNoRound,
  numbersWithComma,
  parseCurrency,
} from '../../../utils/Utils';
import MaterialIcon from '../../commons/MaterialIcon';
import IconHeadingBlock from './IconHeadingBlock';
import GreenRedCheckItem from './GreenRedCheckItem';

const NumberWithItemsText = ({ item }) => {
  return (
    <div className="d-flex align-items-center text-left justify-content-start gap-1 py-2">
      <h1 className="mb-0">{item}</h1>
      <span className="fs-10 font-weight-normal">items</span>
    </div>
  );
};

const AAAddedValueBlock = ({ report, whenPrinting, ignoreHeadings }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Row className={whenPrinting ? 'mt-1 mb-2' : 'mt-3 mb-2'}>
        <Col md={6} className="pr-2">
          <Card style={{ height: 302 }}>
            <CardBody className="d-flex flex-column align-items-start">
              <h5 className="text-left mb-1 d-flex w-100 align-items-center gap-1">
                Payables
              </h5>
              <div className="mb-1 flex-fill w-100 green-red-check-list">
                {Object.entries(report?.paymentMethodsUsed || {}).map(
                  (entry) => (
                    <GreenRedCheckItem key={entry[0]} item={entry} />
                  )
                )}
              </div>

              <Card className="rpt-bg-light-gray w-100">
                <CardBody className="p-2">
                  <h6 className="text-left mb-1 d-flex align-items-center gap-1">
                    Estimated Total Payables
                  </h6>
                  <IconHeadingBlock
                    containerStyle="gap-2"
                    heading={
                      <NumberWithItemsText
                        item={numbersWithComma(report?.estimatedTotalPayables)}
                      />
                    }
                    icon="arrow_upward"
                    iconSize={{ width: 22, height: 22 }}
                    iconStyle={{
                      back: 'var(--secondaryColor)',
                      fore: 'text-white font-size-md',
                    }}
                  />
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} className="pl-0">
          <Card style={{ height: 302 }}>
            <CardBody className="d-flex flex-column align-items-start">
              <h5 className="text-left mb-1 w-100 d-flex align-items-center gap-1">
                Receivables
              </h5>
              <div className="mb-1 flex-fill w-100 green-red-check-list">
                {Object.entries(report?.typesOfReceivables || {}).map(
                  (entry) => (
                    <GreenRedCheckItem key={entry[0]} item={entry} />
                  )
                )}
              </div>
              <Card className="rpt-bg-light-gray w-100">
                <CardBody className="p-2">
                  <h6 className="text-left mb-1 d-flex align-items-center gap-1">
                    Estimated Total Receivables
                  </h6>
                  <IconHeadingBlock
                    containerStyle="gap-2"
                    iconSize={{ width: 22, height: 22 }}
                    heading={
                      <NumberWithItemsText
                        item={numbersWithComma(
                          report?.estimatedTotalReceivables
                        )}
                      />
                    }
                    icon="arrow_downward"
                    iconStyle={{
                      back: 'var(--secondaryColor)',
                      fore: 'text-white font-size-md',
                    }}
                  />
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Card className="mb-2">
        <CardBody>
          <h5 className="text-left mb-1 d-flex align-items-center gap-1">
            Paper to Electronic Opportunity
          </h5>
          <div className={`position-relative mb-2 rpt-green-box py-6`}>
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
                  {isToFixedNoRound(parseCurrency(report?.opportunity))}
                </h1>
              </div>
              <p
                className="fs-9 mb-0 text-black text-center font-weight-normal"
                style={{ maxWidth: 300 }}
              >
                * Annual value of moving <b>JUST 10%</b> more of your payments
                from Paper to Electronic.
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-1">
            <MaterialIcon
              icon="gpp_maybe"
              filled
              clazz="text-orange font-size-lg"
            />
            <span className="fs-10">
              Moving to electronic payments will reduce risk and expense and
              increase efficiency and working capital.
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AAAddedValueBlock;
