import { Card, CardBody } from 'reactstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import React from 'react';
import ReportBarChart from '../../reports/ReportBarChart';

const HeadingIconSet = () => {
  return (
    <div className="p-3 position-relative">
      <div className="mb-0 p-2 position-relative rounded border d-inline-flex align-items-center">
        <MaterialIcon icon="watch_later" filled clazz="text-primary" />
        <div
          className="p-1 rounded-circle position-absolute rpt-blue-box-lite"
          style={{
            right: '-55%',
            top: '-35%',
            width: 10,
            height: 10,
          }}
        >
          &nbsp;
        </div>

        <div
          className="p-1 rounded-circle position-absolute rpt-blue-box-lite"
          style={{
            right: '-5%',
            top: '-45%',
            width: 8,
            height: 8,
          }}
        >
          &nbsp;
        </div>

        <div
          className="p-1 rounded-circle position-absolute rpt-blue-box-lite"
          style={{
            left: '-36%',
            bottom: '-27%',
            width: 12,
            height: 12,
          }}
        >
          &nbsp;
        </div>
      </div>
      <span
        className="fs-8 position-absolute text-muted font-weight-normal"
        style={{ right: 0, top: -10 }}
      >
        Source: AFP
      </span>
    </div>
  );
};
const ReconcilingPayments = ({ whenPrinting }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className="mb-2 text-left">
        <CardBody className="pb-2">
          <HeadingIconSet />
          <div className="d-flex">
            <div>
              <h5 className="text-left mb-1 d-flex align-items-center justify-content-between">
                <p>Hours spent weekly on reconciling payments.</p>
              </h5>
              <p className="fs-10 text-muted mb-0 text-nowrap text-left">
                <b>Source: </b>2022 Payments Cost Benchmarking Study
              </p>
            </div>
            <div className="flex-fill position-relative w-100 mx-4">
              <div
                className="position-absolute w-100"
                style={{ right: 20, top: -75 }}
              >
                <ReportBarChart
                  barData={[
                    {
                      key: '< 1 hr',
                      value: 4,
                      percentage: '34%',
                      color: '65%',
                      multiply: 17,
                    },
                    {
                      key: '1 - 3 hrs',
                      value: 4.2,
                      percentage: '36%',
                      color: '50%',
                      multiply: 17,
                    },
                    {
                      key: '4 - 6 hrs',
                      value: 2,
                      percentage: '14%',
                      color: '85%',
                      multiply: 17,
                    },
                    {
                      key: '> 6 hrs',
                      value: 2.3,
                      percentage: '16%',
                      color: '75%',
                      multiply: 17,
                    },
                  ]}
                  chartStyle={{ maxWidth: 310 }}
                  barStyle={{ width: 50 }}
                  linesCount={9}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReconcilingPayments;
