import { ProgressBar } from 'react-bootstrap';
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { sortAndRearrangeJSONByKeyAtEnd } from '../../../utils/Utils';
const ProgressBarLabel = ({ data, whenPrinting, excelBankMode }) => {
  return (
    <div className="pb-1">
      <div className="d-flex align-items-center justify-content-between">
        <p
          className={`mb-0 ${
            whenPrinting ? 'font-size-xs' : 'font-size-sm2'
          } mb-0 text-truncate`}
        >
          {data.text}
        </p>
        <p
          className={`mb-0 ${whenPrinting ? 'font-size-xs' : 'font-size-sm2'}`}
        >
          {isNaN(data.percentage) ? 0 : data.percentage}%
        </p>
      </div>
      <div className="d-flex align-items-center gap-2 my-1 justify-content-center w-100">
        <div
          className="rpt-bg-dark-gray flex-grow-1"
          style={{ borderRadius: 'var(--borderRadius)' }}
        >
          <ProgressBar
            style={{ height: 12, borderRadius: 'var(--borderRadius)' }}
            isChild={true}
            now={parseInt(data.percentage || '0')}
            max={100}
            key={1}
          />
        </div>
      </div>
    </div>
  );
};

const AAFeeSummaryAllocationBlock = ({
  report,
  feeAllocation,
  whenPrinting,
  ignoreHeadings,
  selectedTenant,
  excelBankMode,
}) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className="mb-2">
        <CardBody>
          <h5 className="text-left mb-1">
            Accounts Payable and Accounts Receivables Fee Allocation
          </h5>
          {Object.entries(
            sortAndRearrangeJSONByKeyAtEnd({ ...feeAllocation })
          ).map((feeAlloc) => (
            <ProgressBarLabel
              key={feeAlloc[0]}
              excelBankMode={excelBankMode}
              data={{
                text: feeAlloc[0],
                percentage: Math.round(parseFloat(feeAlloc[1])),
              }}
              whenPrinting={whenPrinting}
            />
          ))}
          <p className="fs-10 mb-1">
            Bank Deposit Assessment fees are fees associated with FDIC.
          </p>
        </CardBody>
      </Card>
      {whenPrinting && (
        <>
          <br />
          <br />
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

export default AAFeeSummaryAllocationBlock;
