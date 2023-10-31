import { Col, Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import moment from 'moment';
import {
  formatNumberV2,
  isToFixedNoRound,
  parseCurrency,
} from '../../../utils/Utils';
import IconHeadingBlock from './IconHeadingBlock';
import MaterialIcon from '../../commons/MaterialIcon';
import ReportDownloadWrapper from './ReportDownloadWrapper';

const regex = /^(\d+\.\d{0,10})%/;

const AAFeeSummaryOverviewBlock = ({
  report,
  whenPrinting,
  ignoreHeadings,
  editCallback,
  excelBankMode,
}) => {
  const [feesMode, setFeesMode] = useState({
    key: 1,
    label: 'Total Fees Paid',
    isSelected: true,
  });
  const value9 = parseCurrency(report.value9 || '$0');
  const value5 = parseCurrency(report.value5);
  const [, setPaidAndOffset] = useState({
    paid: value9 > value5 ? '$0' : value5 - value9,
    offset: value9 > value5 ? '$0' : value5 - value9,
  });
  const getFormattedPercentage = (value, ignoreMatching) => {
    let result = '0%';
    if (value) {
      if (ignoreMatching) {
        result = `${parseFloat(value).toFixed(2)}%`;
      } else {
        const roundPercentage = value.match(regex);
        if (roundPercentage) {
          const parsedPercentage = parseFloat(roundPercentage[1]);
          const roundedPercentage = Math.round(parsedPercentage * 100) / 100;
          result = `${roundedPercentage.toFixed(2)}%`;
        }
      }
    }
    return result;
  };

  const [formattedPercentage, setFormattedPercentage] = useState(
    getFormattedPercentage(report?.value6)
  );

  useEffect(() => {
    setFormattedPercentage(getFormattedPercentage(`${report?.value6}`, true));
  }, [report?.value6]);

  useEffect(() => {
    if (report?.feesMode) {
      if (report.feesMode.key === 1) {
        // fees paid
        setPaidAndOffset({
          paid: value9 > value5 ? '$0' : value5 - value9,
          offset: value9 > value5 ? '$0' : value5 - value9,
        });
      } else {
        // fees offset
        setPaidAndOffset({
          paid: value9 > value5 ? '$0' : value5 - value9,
          offset: value9 > value5 ? value5 : value5 - value9,
        });
      }
      setFeesMode(report.feesMode);
    }
  }, [report?.feesMode]);
  return (
    <ReportDownloadWrapper whenPrinting={whenPrinting}>
      {!ignoreHeadings && (
        <>
          <br />
          <IconHeadingBlock
            heading="Fee Summary"
            containerStyle="gap-1 mb-2"
            icon="price_check"
          />
        </>
      )}

      <Card className={`mb-2 ${!whenPrinting && ignoreHeadings ? 'mt-2' : ''}`}>
        <CardBody>
          <h5 className="text-left mb-1">Balances and Earnings Credit</h5>
          <Row className={`align-items-center position-relative`}>
            <Col md={5} className="position-relative">
              <div
                style={{
                  height: 230,
                  width: '100%',
                  border: '1px solid #F1F1F8',
                  borderRadius: 'var(--borderRadius)',
                  background:
                    'linear-gradient(46.34deg, #F8F8FA -11.7%, #FFFFFF 65.74%)',
                }}
              >
                <div className="position-absolute abs-center-xy">
                  <div className={`mb-1 fw-bolder text-black`}>
                    <div className="d-flex gap-2 justify-content-center align-items-center">
                      <div className="icon-wrap-black align-items-center justify-content-center">
                        <MaterialIcon
                          icon="attach_money"
                          clazz="icon-money-black font-size-xl p-1_2 text-white"
                        />
                      </div>
                      <h1 className="mb-0 text-black font-size-2em">
                        {report.totalFees === '$0'
                          ? '$0'
                          : parseCurrency(report.totalFees) < 99999
                          ? isToFixedNoRound(parseCurrency(report.totalFees))
                          : formatNumberV2(parseCurrency(report.totalFees))}
                      </h1>
                    </div>
                  </div>
                  <p className="fs-9 text-center">{feesMode?.label}</p>
                </div>
              </div>
            </Col>
            <Col className="text-left font-size-sm2 ml-0 pl-1">
              <p className="mb-2">
                You paid
                <span className="rounded rpt-bg-light-gray p-1 mx-1">
                  <b>
                    {report.totalFees === '$0' ? (
                      '$0 '
                    ) : (
                      <> {isToFixedNoRound(parseCurrency(report.totalFees))} </>
                    )}
                    in fees{' '}
                  </b>
                </span>{' '}
                in {moment(report.value2).format('MMMM, YYYY')}.
              </p>
              <p className="mb-2 rounded rpt-bg-light-gray p-2">
                Your total bank fees were{' '}
                <b>{isToFixedNoRound(parseCurrency(report.value5))}</b>. Your
                balances earn {formattedPercentage} basis points towards these
                fees. This month, your earnings allowance was{' '}
                <b>{isToFixedNoRound(parseCurrency(report.value9))}</b> based on
                your balances of{' '}
                <b>{isToFixedNoRound(parseCurrency(report.value7))}</b>.
              </p>
              <p className="mb-0 rounded rpt-bg-light-gray p-2">
                To cover all your bank fees, you would need to have had{' '}
                <b>{isToFixedNoRound(parseCurrency(report.value8))}</b> in
                collected balances.
              </p>
              <div className="fs-10 mt-2 mb-0">
                Please see the attached Proforma for more details.
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </ReportDownloadWrapper>
  );
};

export default AAFeeSummaryOverviewBlock;
