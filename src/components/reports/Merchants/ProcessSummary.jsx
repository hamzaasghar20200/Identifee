import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { CardTransactions } from './MerchantsCardTransactions';
import MaterialIcon from '../../commons/MaterialIcon';
import { MerchantsAlert } from './MerchantsAlert';
import { parseCurrency } from '../../../utils/Utils';

const Transactions = [
  {
    icon: 'contactless',
    title: 'Total Transactions',
    key: 'total_transactions',
    classnames: 'pr-2',
    total: 0,
    col: 6,
  },
  {
    icon: 'price_change',
    title: 'Total Dollars Processed',
    total: '$0',
    classnames: 'pl-2',
    key: 'totalDollarsProcessed',
    col: 6,
  },
  {
    icon: 'price_check',
    title: 'Average Transaction',
    key: 'average_transactions',
    total: '$0',
    classnames: 'pr-2',
    col: 6,
  },
  {
    icon: 'monetization_on',
    title: 'Average Fee',
    key: 'averagefee',
    total: '$0',
    classnames: 'pl-2',
    col: 6,
  },
  {
    icon: 'currency_exchange',
    title: 'Total Fees',
    total: '$0',
    classnames: '',
    key: 'totalFees',
    col: 12,
  },
];
const alertData = {
  desc: 'Accepting more card payments can continue to positively impact your cash flow by allowing you to receive payments faster. On average, a card payment will be deposited into your account 2 days faster than other methods.',
  icon: 'lightbulb',
  classnames: '',
  textClass: 'text-left',
  color: 'text-primary',
};
export const ProcessingSummary = ({ report, startDownload }) => {
  const [transaactionsHistory, setTransactionHistory] = useState([]);
  useEffect(() => {
    if (Object.keys(report).length > 0) {
      Transactions.forEach((child) => {
        const name = child.key;
        if (name === 'averagefee') {
          const totalFees = parseCurrency(report?.totalFees);
          const totalTransactions = parseCurrency(report?.total_transactions);

          if (!isNaN(totalTransactions) && totalTransactions !== 0) {
            const totalValue = (totalFees / totalTransactions).toFixed(2);
            child.total = `${totalValue}`;
          } else {
            child.total = '0';
          }
        } else if (
          name === 'average_transactions' &&
          report?.totalDollarsProcessed
        ) {
          const totalFees = parseCurrency(report?.totalDollarsProcessed);
          const totalTransactions = parseCurrency(report?.total_transactions);

          if (!isNaN(totalTransactions) && totalTransactions !== 0) {
            const totalValue = (totalFees / totalTransactions).toFixed(2);
            child.total = `${totalValue}`;
          } else {
            child.total = '0';
          }
        } else {
          if (report[name]) {
            child.total = `${parseCurrency(report[name])}`;
          } else {
            child.total = '0';
          }
        }
      });
      setTransactionHistory(Transactions);
    }
  }, [report]);

  return (
    <>
      <div
        className={`py-3 px-4 text-left ${
          startDownload ? 'p-0 px-0 rounded-0' : ''
        }`}
      >
        <div className={startDownload ? 'px-3' : ''}>
          <div>
            {startDownload && (
              <MaterialIcon
                icon="account_balance"
                clazz={`${
                  startDownload ? 'font-size-xl' : 'font-size-2xl'
                } bg-gray-500 rounded-circle text-light p-2`}
              />
            )}
            <div className="text-left mt-2">
              <h4 className={`fw-bold mb-3`}>Processing Summary</h4>
            </div>
          </div>

          <div className="text-left">
            <Card className="border-0 rounded-lg shadow">
              <Card.Header className="fw-bold border-0 pb-1">
                By The Numbers
              </Card.Header>
              <Card.Body className="pt-2">
                <Row>
                  {transaactionsHistory?.map((item, i) => (
                    <Col
                      md={item?.col}
                      key={i}
                      className={` ${i === 0 || i === 1 ? '' : 'mt-3'} ${
                        item?.classnames
                      }`}
                    >
                      <CardTransactions
                        report={report}
                        item={item}
                        startDownload={startDownload}
                      />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </div>
          <div className={`${startDownload ? '' : ''} mt-3`}>
            <MerchantsAlert data={alertData} startDownload={startDownload} />
          </div>
        </div>
      </div>
    </>
  );
};
