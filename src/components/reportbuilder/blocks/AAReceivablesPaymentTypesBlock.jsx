import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { numbersWithComma } from '../../../utils/Utils';
import IconHeadingBlock from './IconHeadingBlock';
import ReportDownloadWrapper from './ReportDownloadWrapper';

const PaymentType = ({ data, style }) => {
  return (
    <Card className={`flex-fill ${style}`}>
      <CardBody className="position-relative">
        <p className="mb-0 text-left position-absolute top-0 left-0 m-2 fs-9">
          {data.title}
        </p>
        <h1 className="mb-0 fw-bolder mt-2 text-gray-search">{data.value}</h1>
      </CardBody>
    </Card>
  );
};
const AAReceivablesPaymentTypesBlock = ({
  report,
  whenPrinting,
  ignoreHeadings,
  editCallback,
  excelBankMode,
}) => {
  return (
    <>
      <ReportDownloadWrapper whenPrinting={whenPrinting}>
        {!ignoreHeadings && (
          <IconHeadingBlock
            heading="Receivables"
            icon="arrow_downward"
            containerStyle="gap-1 mb-3"
          />
        )}
        <div className="d-flex align-items-center justify-content-between gap-2">
          <PaymentType
            data={{
              title: 'Checks',
              value: numbersWithComma(report.value14 || '0'),
            }}
          />
          <PaymentType
            data={{
              title: 'ACH',
              value: numbersWithComma(report.value15 || '0'),
            }}
          />
          {excelBankMode && (
            <PaymentType
              data={{
                title: 'Credit Card',
                value: numbersWithComma(report.receiveableCreditCard || '0'),
              }}
            />
          )}
          <PaymentType
            data={{
              title: 'Wires',
              value: numbersWithComma(report.value16 || '0'),
            }}
          />
        </div>
        <p className="fs-9 mt-2 mb-0">
          *Does not display all payment types. For further details, please
          review your Account Analysis statement.
        </p>
      </ReportDownloadWrapper>
    </>
  );
};

export default AAReceivablesPaymentTypesBlock;
