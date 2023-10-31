import { Col, ProgressBar, Row } from 'react-bootstrap';
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import AAPaymentRisksBlock from './AAPaymentRisksBlock';
import ReportDownloadWrapper from './ReportDownloadWrapper';
import {
  DemoTenantsKeys,
  PayableBlockTypes,
} from '../../reports/reports.constants';
import useIsTenant from '../../../hooks/useIsTenant';

const DescriptionsByType = {
  [PayableBlockTypes.DPO.key]: [
    'Your Days Payable Outstanding (DPO) is the average time, in days, that you take to pay your bills and invoices to your suppliers/vendors.',
    'Maximizing your DPO without distressing vendor/supplier relationships will allow you to increase working capital and free cash flow.',
  ],
  [PayableBlockTypes.DSO.key]: [
    'Your Days Sales Outstanding (DSO) is a measure of the average number of days that it takes you to collect payment for a sale (accounts receivable).',
    'Minimizing your DSO means you are collecting your money faster and can put it to use earlier by reinvesting in the business or paying down debt.',
  ],
};
const TreasuryBlock = ({ loader, report, insightsData }) => {
  const lessThan2500 = insightsData?.rpmg?.transaction_summary.find(
    (ts) => ts.transaction.range === '<2500'
  );
  const allCardsPayment = lessThan2500?.all_card_platforms;
  return (
    <Row className={`align-items-center text-center position-relative my-2`}>
      <Col md={4}>
        <div
          className="position-absolute abs-center-y"
          style={{
            height: 130,
            width: '100%',
            border: '1px solid #E0EDE0',
            borderRadius: 'var(--borderRadius)',
            background:
              'linear-gradient(45.1deg, #E9F4E9 -18.44%, rgba(233, 244, 233, 0) 115.59%)',
          }}
        >
          <div className="position-absolute w-100 abs-center-xy">
            <div className={`mb-1 fw-bolder text-black`}>
              <div className="d-flex gap-2 justify-content-center align-items-center">
                <h1 className="mb-0 rpt-green-box-heading font-weight-bold font-size-2em">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>{allCardsPayment}%</>
                  )}
                </h1>
              </div>
            </div>
            <p
              className="fs-10 font-weight-medium m-auto"
              style={{ width: '70%' }}
            >
              Vendor payments by commercial card{' '}
            </p>
          </div>
        </div>
      </Col>
      <Col md={8} className="text-left font-size-sm2">
        <p className="pt-2 ml-3">
          On average, your peers pay{' '}
          {loader ? (
            <Skeleton width={50} height={20} />
          ) : (
            <>{allCardsPayment}%</>
          )}{' '}
          of all payments with a dollar value of $2,500 or less by commercial
          card, providing a substantial increase in Days Payable Outstanding.
        </p>
        <div className="py-1 pt-1 ml-3">
          <div
            className="rpt-bg-dark-gray"
            style={{ borderRadius: 'var(--borderRadius)' }}
          >
            <ProgressBar
              style={{ height: 12 }}
              isChild={true}
              now={allCardsPayment || 0}
              max={100}
              className={'progress-bar-green'}
              key={1}
            />
          </div>
          <div className="d-flex mt-2 align-items-center gap-2">
            <div className="d-flex align-items-center gap-1">
              <span
                className={`rounded-circle bg-success`}
                style={{ height: 12, width: 12 }}
              ></span>
              <p className="fs-10 mb-0">Vendor payments by card</p>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span
                className="rounded-circle rpt-bg-dark-gray"
                style={{ height: 12, width: 12 }}
              ></span>
              <p className="fs-10 mb-0">Vendor payments by other</p>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

const WorkingCapitalBlock = ({ loader, report, type }) => {
  const { key, title, short } = type;
  return (
    <Row className={`align-items-center text-center position-relative my-2`}>
      <Col md={4}>
        <div
          className="position-absolute abs-center-y"
          style={{
            height: 130,
            width: '100%',
            border: '1px solid #E0EDE0',
            borderRadius: 'var(--borderRadius)',
            background:
              'linear-gradient(45.1deg, #E9F4E9 -18.44%, rgba(233, 244, 233, 0) 115.59%)',
          }}
        >
          <div className="position-absolute w-100 abs-center-xy">
            <div className={`mb-1 fw-bolder text-black`}>
              <div className="d-flex gap-2 justify-content-center align-items-center">
                <h1 className="mb-0 rpt-green-box-heading font-weight-bold font-size-2em">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>{report[`your${short}`] || 0}</>
                  )}
                </h1>
              </div>
            </div>
            <p
              className="fs-10 font-weight-medium m-auto"
              style={{ width: '70%' }}
            >
              {title}
            </p>
          </div>
        </div>
      </Col>
      <Col md={8} className="text-left">
        <p className="pt-2 mb-1 ml-3 fs-7">{DescriptionsByType[key][0]}</p>
        <p className="ml-3 pt-1 fs-7">{DescriptionsByType[key][1]}</p>
      </Col>
    </Row>
  );
};

const AAPayablesPaymentBreakdownBlock = ({
  report,
  insightsData,
  whenPrinting,
  loader,
  title = 'Payment Breakdown',
  fromWorkingCapitalReport = false,
  type,
  sponsorLogo = true,
  selectedTenant,
}) => {
  const { isSVB } = useIsTenant();
  return (
    <>
      <ReportDownloadWrapper whenPrinting={whenPrinting}>
        <Card className="mb-2">
          <CardBody className="pb-2">
            <div className="d-flex align-items-center justify-content-between">
              <h4 className={`mb-0`}>{title}</h4>
              {sponsorLogo && (
                <img
                  src="/img/integrations/RPMG-Logo.png"
                  style={{ width: 50, objectFit: 'contain' }}
                />
              )}
            </div>
            {fromWorkingCapitalReport ? (
              <WorkingCapitalBlock
                report={report}
                insightsData={insightsData}
                loader={loader}
                type={type}
              />
            ) : (
              <TreasuryBlock
                loader={loader}
                report={report}
                insightsData={insightsData}
              />
            )}
          </CardBody>
        </Card>
      </ReportDownloadWrapper>
      {!fromWorkingCapitalReport &&
      !isSVB &&
      selectedTenant?.key !== DemoTenantsKeys.svb ? (
        <AAPaymentRisksBlock whenPrinting={whenPrinting} report={report} />
      ) : (
        <>{whenPrinting ? <div style={{ height: 300 }} /> : null}</>
      )}
    </>
  );
};

export default AAPayablesPaymentBreakdownBlock;
