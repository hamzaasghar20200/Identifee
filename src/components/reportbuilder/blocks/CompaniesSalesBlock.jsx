import { Card, CardBody } from 'reactstrap';
import ReportBarChart from '../../reports/ReportBarChart';
import React from 'react';

const CompaniesSalesBlock = ({ whenPrinting }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className="mb-2">
        <CardBody>
          <h5 className="text-left mb-1 d-flex align-items-center gap-1">
            Companies Accelerate Shift to Electronic Payments for Growth
          </h5>
          <p className="text-muted mb-1 fs-8 text-left">
            Companies plan to expand their usage of electronic types in coming
            year to streamline operations, reduce risk and improve days payable.
          </p>
          <div className="pl-4">
            <ReportBarChart
              barData={[
                {
                  key: 'ACH',
                  value: 61,
                  symbol: '%',
                  clazz: 'bg-primary',
                },
                {
                  key: 'Virtual Card',
                  value: 28,
                  symbol: '%',
                  clazz: 'bg-primary',
                },
                {
                  key: 'Real-time Payments',
                  value: 27,
                  symbol: '%',
                  clazz: 'bg-primary',
                },
                {
                  key: 'Same Day ACH',
                  value: 23,
                  symbol: '%',
                  clazz: 'bg-primary',
                },
              ]}
              linesCount={5}
              barStyle={{
                width: 150,
                margin: '0 20px 0 20px',
              }}
              lineHeight={30}
              withIntervals={['100%', '75%', '50%', '25%', '0%']}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CompaniesSalesBlock;
