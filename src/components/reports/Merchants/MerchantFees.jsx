import { Card, ProgressBar, Row, Col } from 'react-bootstrap';
import { ProgressCardFees } from './ProgressCardFees';
import { RefundCard } from './RefundCard';
import { MerchantsAlert } from './MerchantsAlert';
import { useEffect, useState } from 'react';
import {
  isToFixedNoRound,
  numberWithCommas,
  parseCurrency,
} from '../../../utils/Utils';

const ProgressCircleData = [
  {
    name: 'Interchange and Network',
    key: 'interchange',
    description:
      'Approximately 0% of your fees are interchange and network fees.',
    variant: 'var(--lostDarkColor)',
    textColor: 'var(--lostDarkColor)',
    classnames: 'pr-2',
    boldText:
      'There are ways to influence these fees, but they are not controlled by your bank.',
    progress: 0,
  },
  {
    name: 'Processor',
    key: 'processor',
    description: `Approximately 0% of your fees are processor fees.`,
    textColor: 'var(--excel-gray)',
    variant: 'var(--excel-gray)',
    classnames: 'pl-2',
    boldText:
      'Processor Fees cover account servicing, regulatory reporting requirements, and risk management.',
    progress: 0,
  },
];

const alertData = {
  desc: 'The majority of your fees are not controlled by the Processor. Talk to your representative about savings opportunities related to interchange fee optimization.',
  icon: 'lightbulb',
  textClass: 'text-left',
  classnames: '',
  color: 'text-primary',
};
const RefundCardData = [
  {
    name: 'Refunds',
    description: '0 of your 0 transactions resulted in a refund totalling $0.',
    varient: '#fff4ee',
    textColor: '#ff8f50',
    classnames: 'pr-2',
    progress: 0,
    key: 'refunds',
  },
  {
    name: 'Chargebacks',
    description:
      '0 of your 0 transactions resulted in a chargeback, totalling $0.',
    varient: '#fdeded',
    textColor: '#ef4a4a',
    progress: 0,
    key: 'chargebacks',
    classnames: 'pl-2',
  },
];

export const MerchantFees = ({ report, startDownload, readOnly }) => {
  const [RefundData, setRefundData] = useState([]);
  const [ProgressData, setProgressData] = useState([]);
  const totalFees = parseCurrency(report?.processorFees);
  const totalTransactions = parseCurrency(report?.totalFees);
  const progressPercentage =
    !isNaN(totalTransactions) &&
    !isNaN(totalFees) &&
    totalTransactions !== 0 &&
    totalFees !== 0 &&
    ((totalFees / totalTransactions) * 100).toFixed(2);
  useEffect(() => {
    if (Object.keys(report).length > 0) {
      RefundCardData.forEach((child) => {
        const name = child.key;
        if (name === 'refunds') {
          const totalFees = parseCurrency(report?.refund);
          const totalTransactions = parseCurrency(
            report?.totalDollarsProcessed
          );
          if (
            !isNaN(totalFees) &&
            !isNaN(totalTransactions) &&
            totalTransactions !== 0 &&
            totalFees !== 0
          ) {
            const totalValue = ((totalFees / totalTransactions) * 100).toFixed(
              2
            );
            child.progress = totalValue;
            const total = report?.total_transactions;
            if (report?.refund_count || total || report?.refund) {
              child.description = `${numberWithCommas(
                report?.refund_count
              )} of your ${numberWithCommas(
                total
              )} transactions resulted in a refund, totaling ${isToFixedNoRound(
                Math.abs(totalFees)
              )}.`;
            }
          } else {
            child.description =
              '0 of your 0 transactions resulted in a refund, totaling $0.';
            child.progress = '0';
          }
        } else if (name === 'chargebacks') {
          const chargeBacks = parseCurrency(report?.chargebacks);
          const totalDollarsProcessed = parseCurrency(
            report?.totalDollarsProcessed
          );
          if (
            !isNaN(chargeBacks) &&
            !isNaN(totalTransactions) &&
            totalTransactions !== 0 &&
            chargeBacks !== 0
          ) {
            const totalValue = (
              (chargeBacks / totalDollarsProcessed) *
              100
            ).toFixed(2);
            child.progress = totalValue;
            const total = report?.total_transactions;
            if (
              total !== 0 ||
              report?.chargebacks_count ||
              report?.chargebacks
            ) {
              child.description = `${numberWithCommas(
                report?.chargebacks_count
              )} of your ${numberWithCommas(
                total
              )} transactions resulted in a chargeback, totaling ${
                report?.chargebacks
                  ? isToFixedNoRound(Math.abs(chargeBacks))
                  : '$0'
              }.`;
            }
          } else {
            child.description =
              '0 of your 0 transactions resulted in a chargeback, totaling $0.';
            child.progress = '0';
          }
        }
      });
      setRefundData(RefundCardData);

      ProgressCircleData.forEach((child) => {
        const name = child.key;
        if (name === 'interchange') {
          const totalFees = parseCurrency(report?.interchangeAndNetworkFees);
          const totalTransactions = parseCurrency(report?.totalFees);

          if (
            !isNaN(totalTransactions) &&
            !isNaN(totalFees) &&
            totalTransactions !== 0 &&
            totalFees !== 0
          ) {
            const totalValue = Math.round(
              (totalFees / totalTransactions) * 100
            );
            child.description = '';
            child.progress = totalValue;
            if (totalValue !== 0) {
              child.description = `Approximately ${totalValue}% of your fees are interchange and network fees.`;
            }
          } else {
            child.description =
              'Approximately 0% of your fees are interchange and network fees.';
            child.progress = '0';
          }
        } else if (name === 'processor') {
          const totalFees = parseCurrency(report?.totalFees);
          const totalProcessorFees = parseCurrency(report?.processorFees);

          if (
            !isNaN(totalTransactions) &&
            !isNaN(totalFees) &&
            totalProcessorFees !== 0 &&
            totalFees !== 0
          ) {
            const totalValue = Math.round(
              (totalProcessorFees / totalFees) * 100
            );
            child.progress = totalValue;
            if (totalValue !== 0) {
              child.description = `Approximately ${totalValue}% of your fees are processor fees.`;
            }
          } else {
            child.description =
              'Approximately 0% of your fees are processor fees.';
            child.progress = '0';
          }
        }
      });

      setProgressData(ProgressCircleData);
    }
  }, [report]);

  return (
    <div className={`px-4 pb-4 ${startDownload ? 'p-0 px-0 rounded-0' : ''}`}>
      <div className={startDownload ? 'px-3 pt-3' : ''}>
        <Card>
          <Card.Body className="text-left">
            <h4 className={`mb-0`}>How Merchant Fees Are Calculated</h4>
            <p
              className={`${startDownload ? 'font-size-xs' : 'font-size-sm2'}`}
              style={{ lineHeight: '20px' }}
            >
              There are two main categories that make up your merchant
              processing fees:{' '}
              <span className={startDownload ? 'd-block' : ''}>
                {' '}
                Interchange and Network Fees + Processor Fees
              </span>
            </p>
            <div>
              <ProgressBar
                style={{
                  height: 15,
                  width: '100%',
                }}
                now={progressPercentage}
                max={100}
                variant="bg-primary"
                visuallyHidden
              />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-8">0%</span>
                <span className="fs-8">100%</span>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Row>
          {ProgressData?.map((item) => (
            <Col md={6} key={item} className={item?.classnames}>
              <ProgressCardFees
                readOnly={readOnly}
                data={item}
                startDownload={startDownload}
              />
            </Col>
          ))}
        </Row>
        <br className="mb-0" />
        <Row>
          {RefundData?.map((item) => (
            <Col md={6} key={item} className={`mt-2 ${item?.classnames}`}>
              <RefundCard data={item} startDownload={startDownload} />
            </Col>
          ))}
        </Row>
        <div className="mt-3">
          <MerchantsAlert data={alertData} startDownload={startDownload} />
        </div>
      </div>
    </div>
  );
};
